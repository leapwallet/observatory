# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The server and HTTP API use the same version number. Major and minor versions get based off of the HTTP API. For example, if the server has a backward incompatible change but the APIs haven't changed, then only the patch number gets bumped.

## [0.2.0](https://github.com/leapwallet/observatory/releases/tag/v0.2.0) - 2023-04-03

### Added
- Support to query all nodes of a given chain

### Changed

- pinger accepts "chainName" as well as "url"
- URL input is from chainNodeList.json which is committed as well

## [0.1.0](https://github.com/leapwallet/observatory/releases/tag/v0.1.0) - 2022-11-11

### Added

- First version.
