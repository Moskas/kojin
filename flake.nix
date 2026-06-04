{
  description = "kojin — personal website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            vips
            pkg-config
            exiftool
          ];

          shellHook = ''
            export PKG_CONFIG_PATH="${pkgs.vips}/lib/pkgconfig:''${PKG_CONFIG_PATH:-}"
            export LD_LIBRARY_PATH="${pkgs.stdenv.cc.cc.lib}/lib:${pkgs.vips}/lib:''${LD_LIBRARY_PATH:-}"
          '';
        };
      });
}
