# code from https://www.delftstack.com/howto/python/python-get-json-from-url/

import requests, json
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

# TODO: figure out how to post cleaned JSON to retrieve in map js 