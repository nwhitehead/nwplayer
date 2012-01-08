gae_upload: gae_copy
	python ~/google_appengine/appcfg.py update out

gae_test: gae_copy
	python ~/google_appengine/dev_appserver.py out

gae_copy:
	mkdir -p out
	cp -r js out
	cp -r css out
	cp -r gfx out
	cp -r test out
	cp test/app.yaml out

clean:
	rm -fr out
