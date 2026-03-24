hash    := $(shell git rev-parse --short HEAD)
type    := mv mz
verfn   := cheat-version-description.json
verjson := '{ "version" : "$(hash)" }'

.PHONY: all clean $(type)

all: $(type)

clean:
	-rm *.tar.gz $(verfn)

%-$(hash).tar.gz: $(verfn)
	COPYFILE_DISABLE=1 tar -cavf $@ \
		$(verfn) \
		-C cheat-engine/www cheat \
		-C _cheat_initialize/$* js

$(type):%:%-$(hash).tar.gz
	@echo finished packing $@

$(verfn):
	echo $(verjson) > $(verfn)
