require 'Nokogiri'

output = File.open("daily_list_index.txt", 'w')

url = "2013-2010.html"
a = open(url, "rb").read
doc = Nokogiri::HTML(a)
b = doc.css(".pipe a")
b.each_with_index do |a, index|
	if a["href"].include?("issuenav")
		output << "#{index+1} #{a["href"]}\n"
	end
end
output.close()

