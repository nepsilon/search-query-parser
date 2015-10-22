BINS=./node_modules/.bin

install:
	@npm install .

test: 
	@$(BINS)/mocha -R spec

.PHONY: test
