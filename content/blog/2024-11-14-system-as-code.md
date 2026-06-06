---
title: "System as Code"
author: "Moskas"
date: "2024-11-14"
tags: ["Nix","Devops"]
---
As of almost a year I&rsquo;ve been a full time Nix/NixOS user. One of the things that got me hooked on Nix was the declaration of system state written in code.

# What does it mean?

Let&rsquo;s step back a bit. When you think about regular Linux distro one of the first thing that might pop in your head is it&rsquo;s package manager. For debian based distros it&rsquo;s apt, for arch it&rsquo;s pacman etc.
These package managers do what they are supposed to do, install/remove/update packages and dependencies. On it&rsquo;s own it&rsquo;s fine for most of the people.
The rest is up to the user, configuration, manual installation and other regular Linux stuff.

# The (not only me) problem

I myself use a couple of different devices and I had situations that I had to remember to install or change something on the other devices to keep it in sync with my other (mainly main desktop) config.
That became an annoyance that just occurred from time to time when I was using Arch. But that&rsquo;s how imperative package management is.
One time when I&rsquo;ve got fed up with such occurrences. I&rsquo;ve decided it&rsquo;s time to ditch the imperative way and try out declarative system configuration.

# The declarative configuration

You might have heard about something like Terraform, Ansible. These are the tools that allow us to write a.k.a. declare the state that your system/application configuration should look like when you deploy it.

# Nix

Nix with NixOS is even better. With it I can declare configurations for multiple devices with different architectures and get my exact system right after the install.
I have configs for my [desktop](https://github.com/Moskas/nixos-config/tree/master/hosts/cheshire), [laptop](https://github.com/Moskas/nixos-config/tree/master/hosts/roon) and [home server](https://github.com/Moskas/nixos-config/tree/master/hosts/laffey) in one place. That allows me for having a portable setup.

