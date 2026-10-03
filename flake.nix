{
  description = "kojin — personal website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        kojin-deps = pkgs.stdenv.mkDerivation {
          pname = "kojin-deps";
          version = "0.1.0";

          src = pkgs.lib.fileset.toSource {
            root = ./.;
            fileset = pkgs.lib.fileset.unions [
              ./package.json
              ./bun.lock
            ];
          };

          nativeBuildInputs = [ pkgs.bun ];

          buildPhase = ''
            runHook preBuild
            export HOME="$TMPDIR"
            bun install --frozen-lockfile --no-progress
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p "$out"
            cp -r node_modules "$out/node_modules"
            runHook postInstall
          '';

          outputHashMode = "recursive";
          outputHashAlgo = "sha256";
          # Updated after the first build attempt prints the real hash.
          outputHash = "sha256-Pm2/ZGx0v7vyL6j7nfmmnfkMCjEL3E+1EaNzO2WJdHw=";
        };

        kojin = pkgs.stdenv.mkDerivation {
          pname = "kojin";
          version = "0.1.0";

          src = pkgs.lib.fileset.toSource {
            root = ./.;
            fileset = pkgs.lib.fileset.unions [
              ./src
              ./content
              ./package.json
              ./tsconfig.json
            ];
          };

          nativeBuildInputs = [ pkgs.makeWrapper ];

          dontConfigure = true;
          dontBuild = true;

          installPhase = ''
            runHook preInstall

            mkdir -p "$out"
            cp -r . "$out"
            cp -r ${kojin-deps}/node_modules "$out/node_modules"

            makeWrapper ${pkgs.bun}/bin/bun "$out/bin/kojin" \
              --add-flags "run $out/src/server.tsx" \
              --set LD_LIBRARY_PATH "${pkgs.stdenv.cc.cc.lib}/lib"

            runHook postInstall
          '';

          passthru = { inherit kojin-deps; };
        };
      in
      {
        packages.default = kojin;

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            vips
            pkg-config
            exiftool
            prettier
            nodejs
          ];

          shellHook = ''
            export PKG_CONFIG_PATH="${pkgs.vips}/lib/pkgconfig:''${PKG_CONFIG_PATH:-}"
            export LD_LIBRARY_PATH="${pkgs.stdenv.cc.cc.lib}/lib:${pkgs.vips}/lib:''${LD_LIBRARY_PATH:-}"
          '';
        };
      }
    )
    // {
      nixosModules.default =
        {
          config,
          lib,
          pkgs,
          ...
        }:
        let
          cfg = config.services.kojin;
        in
        {
          options.services.kojin = {
            enable = lib.mkEnableOption "kojin personal website";

            package = lib.mkOption {
              type = lib.types.package;
              default = self.packages.${pkgs.system}.default;
              description = "kojin package to run.";
            };

            port = lib.mkOption {
              type = lib.types.port;
              default = 3000;
              description = "Port for the kojin HTTP server to listen on.";
            };

            siteUrl = lib.mkOption {
              type = lib.types.str;
              description = "Public URL of the site, used in Atom feeds.";
            };

            siteAuthor = lib.mkOption {
              type = lib.types.str;
              default = "kojin";
              description = "Author name used in Atom feeds.";
            };

            environmentFile = lib.mkOption {
              type = lib.types.nullOr lib.types.path;
              default = null;
              description = ''
                Path to an EnvironmentFile containing secret env vars for the
                /now page, as `KEY=VALUE` lines:

                  LASTFM_API_KEY=...
                  LASTFM_USERNAME=...
                  ANILIST_USER_ID=...

                Intended to be a secret managed by sops-nix (or agenix),
                e.g. `config.sops.secrets.kojin-env.path`. Systemd reads this
                file directly at service start, so the values never pass
                through the Nix store.
              '';
            };

            openFirewall = lib.mkOption {
              type = lib.types.bool;
              default = false;
              description = "Open the firewall for services.kojin.port.";
            };
          };

          config = lib.mkIf cfg.enable {
            users.users.kojin = {
              isSystemUser = true;
              group = "kojin";
            };
            users.groups.kojin = { };

            # bun resolves tsconfig.json / node_modules relative to the
            # working directory it's launched from, not the entry script's
            # location, so everything except the writable cache/db needs to
            # be symlinked into place here too.
            systemd.tmpfiles.rules = [
              "L+ /var/lib/kojin/content - - - - ${cfg.package}/content"
              "L+ /var/lib/kojin/src - - - - ${cfg.package}/src"
              "L+ /var/lib/kojin/node_modules - - - - ${cfg.package}/node_modules"
              "L+ /var/lib/kojin/package.json - - - - ${cfg.package}/package.json"
              "L+ /var/lib/kojin/tsconfig.json - - - - ${cfg.package}/tsconfig.json"
            ];

            systemd.services.kojin = {
              description = "kojin personal website";
              after = [ "network.target" ];
              wantedBy = [ "multi-user.target" ];

              environment = {
                PORT = toString cfg.port;
                DB_PATH = "/var/lib/kojin/kojin.db";
                SITE_URL = cfg.siteUrl;
                SITE_AUTHOR = cfg.siteAuthor;
              };

              serviceConfig = {
                Type = "simple";
                User = "kojin";
                Group = "kojin";
                WorkingDirectory = "/var/lib/kojin";
                StateDirectory = "kojin";
                ExecStart = "${cfg.package}/bin/kojin";
                Restart = "on-failure";
                RestartSec = 5;
                NoNewPrivileges = true;
                ProtectSystem = "strict";
                ReadWritePaths = [ "/var/lib/kojin" ];
                EnvironmentFile = lib.mkIf (cfg.environmentFile != null) cfg.environmentFile;
              };

              # Content and code only change when the package changes; the
              # search index is built once at startup, so a new post needs an
              # actual restart, not just an updated symlink.
              restartTriggers = [ cfg.package ];
            };

            networking.firewall.allowedTCPPorts = lib.optional cfg.openFirewall cfg.port;
          };
        };
    };
}
