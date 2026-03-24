hash    := $(shell git rev-parse --short HEAD)
type    := mv mz
verfn   := cheat-version-description.json
verjson := '{ "version" : "$(hash)" }'
shiki   := cheat-engine/www/cheat/libs/shiki.bundle.mjs

.PHONY: all clean $(type)

all: $(type)

$(shiki):
	pnpm run vendor:shiki

clean:
	-rm *.tar.gz $(verfn) $(shiki)

%-$(hash).tar.gz: $(verfn) $(shiki)
	COPYFILE_DISABLE=1 tar -cavf $@ \
		$(verfn) \
		-C cheat-engine/www cheat \
		-C _cheat_initialize/$* js

$(type):%:%-$(hash).tar.gz
	@echo finished packing $@

$(verfn):
	echo $(verjson) > $(verfn)
