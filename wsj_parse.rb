require 'net/http'
require 'Nokogiri'
require 'mechanize' 

def resultTitle(url)
	agent = Mechanize.new  
	page = agent.get(url)
	doc = Nokogiri::HTML(page.body)
	b = doc.css(".resultTitle") 

	b.each do |a|
		if a["href"].include?("docview")
			puts @link = "http://search.proquest.com#{a["href"]}"
			open("WSJ_raw_data/#{@link.split("/")[4]}.html", "w") do |file|
				@page = agent.get(@link)
			    file.write(@page.body)
			end
		end
	end
	puts
end

# 1350 lists
daily_lists = File.open("daily_list_index.txt", 'r').read
puts daily_lists

#
url = "http://search.proquest.com/publicationissue/14217D5DE3122E1348/$5bqueryType$3dpubbrowseDescending:OS$3b+sortType$3dpageNumberAsc$3b+searchTerms$3d$5b$3cAND$7cpubid:10482$3e$5d$3b+searchParameters$3d$7bjstorMuseCollections$3dMUSESTD,+instance$3dprod.academic$7d$3b+metaData$3d$7bpublication.search.filter$3d02013Y11Y21$23Nov+21,_$252013,+SEARCH_ID_TIMESTAMP$3d1385971360741,+publication.name$3dWall+Street+Journal,_$25Eastern+edition$7d$5d/1/Wall+Street+Journal,+Eastern+edition/02013Y11Y21$23Nov+21,+2013?accountid=14229"
agent = Mechanize.new  
page = agent.get(url)
doc = Nokogiri::HTML(page.body)

# total # of result
numbers = doc.css(".pubResultHeading").text
puts ">> 總共 #{numbers} \n"

# parsing page1 (this page)
resultTitle(url)

b = doc.css(".float_left .pub_bottom_sort_by li a")
b.each do |a|
	if a["title"][0] == "P"
		puts ">> go to #{a["title"]}"
		resultTitle("http://search.proquest.com#{a["href"]}")
	end
end