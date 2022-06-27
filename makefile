test-cli:
	@node src/index.js --appsw-root example

test-build:
	@node build/index.js --appsw-root example

test-module:
	@node src/test.js

.PHONY: build
build:
	@rm -rf build
	@mkdir build
	@node src/build.js
	@cp package.public.json build/package.json

publish:
	@cd build && npm publish

sync:
	@rsync --verbose --recursive --compress --checksum --progress --delete -e "ssh -i /keys/dev.pem" ./example/ ubuntu@server-dev.joahquin.com:/var/www/test.joahquin.com
