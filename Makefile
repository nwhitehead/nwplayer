GAE_DIR=/home/nwhitehead/google_appengine
FLEX_DIR=/home/nwhitehead/flex
FLEX_FLAGS=--strict=true
MXMLC=$(FLEX_DIR)/bin/mxmlc
FLEX_SOURCES=flex/nwplayer.mxml
FLEX_OUT=out/flex/nwplayer.swf

gae_upload: gae_copy
	python $(GAE_DIR)/appcfg.py update out

gae_test: gae_copy
	python $(GAE_DIR)/dev_appserver.py out

gae_copy: $(FLEX_OUT)
	mkdir -p out
	mkdir -p out/flex
	cp -r js out
	cp -r css out
	cp -r gfx out
	cp -r test out
	cp test/app.yaml out

$(FLEX_OUT): $(FLEX_SOURCES)
	$(MXMLC) $(FLEX_FLAGS) $(FLEX_SOURCES) -o $(FLEX_OUT)

clean:
	rm -fr out
