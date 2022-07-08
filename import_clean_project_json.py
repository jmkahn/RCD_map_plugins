# code from https://www.delftstack.com/howto/python/python-get-json-from-url/
# this file was used toget and modify the formatting of the Gold Ridge project data that I got from the Project Tracker webservices 
# the modified JSON is the one currently used as a sample for Project data 
# when Sitka updates the webservices, I will do these operations in functions.js 

import requests
url = requests.get("https://www.rcdprojects.org/WebServices/GetProjectsByOrganization/JSON/bcdb2d4b-5d7a-4e25-b2e2-7634453c80e8/62")
text = url.text 

# // removed unescaped newlines (\n -> )
text.replace('/n', '')

# // replace tabs with single spaces ( I don't know if this step was necessary)
text.replace('/t', ' ')
# // replace all interior ' with escaped (' -> \' )
text.replace("'", "\'")

# // replace / with \/  [ I don't think this was necessary]

# // removed unescaped \r (replace with space)
text.replace('\r', ' ')
# //TODO: double escape internal quotes in description of ProjectID 6343, 6344, 13868 
# instead I replaced double quotes with single bc json doesn't recognize single quotes (\" -> ')
text.replace("\"", "'")
