## 1. 每天的 WSJ 頁面連結
- `daily_list_parser.rd`
- parse  手動點擊打開的 `2013-2010.html`檔案
- 產生 2010 ~ 2013 每天的連結
	 - ex: [2013/11/26](http://search.proquest.com/publication.publicationissuebrowse:openissue/issuenav/02013Y11Y26$23Nov+26,+2013?t:ac=publications_10482)
- 列表格式：`daily_list_index.txt`
	- `index link_url`

	```
	31 http://search.proquest.com/publication.publicationissuebrowse:openissue/issuenav/02013Y11Y26$23Nov+26,+2013?t:ac=publications_10482
	32 http://search.proquest.com/publication.publicationissuebrowse:openissue/issuenav/02013Y11Y25$23Nov+25,+2013?t:ac=publications_10482
	33 http://search.proquest.com/publication.publicationissuebrowse:openissue/issuenav/02013Y11Y24$23Nov+24,+2013?t:ac=publications_10482
	...
	```

## 2. 每天中每頁的（一頁含 20 筆 WSJ）