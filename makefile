.PHONY: build
build:
	@rm -rf build
	@mkdir build
	@node src/build.js
	@cp package.public.json build/package.json

test-cli:
	@node build/bin.js --appsw-root example

test-module:
	@node src/test.js

test: build test-cli test-module

publish:
	@cd build && npm publish

sync:
	@rsync --verbose --recursive --compress --checksum --progress --delete -e "ssh -i /keys/dev.pem" ./example/ ubuntu@server-dev.joahquin.com:/var/www/test.joahquin.com
