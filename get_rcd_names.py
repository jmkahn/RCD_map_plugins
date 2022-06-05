import os
import json 

if __name__ == "__main__": 
    print("Writing datalist of RCD names...")

    f = open(os.path.join("data", "RCD_Boundaries2.json"))
    data = json.load(f)
    rcd_boundaries = data['features']

    all_names = []
    for i in range(len(rcd_boundaries)):
        rcd_name = rcd_boundaries[i]['properties']['RCDNAME']
        all_names.append(rcd_name)

    all_names.sort()

    full_list = ''
    for rcd_name in all_names:
        new_entry = '<option value="'+ rcd_name + '">' + rcd_name + '</option>\n'
        full_list += new_entry


    with open(os.path.join("data", 'rcdnames_options.txt'), 'w') as output:
        output.write(full_list)
    
    print("Done.")
    print("This list is used to make the dropdown menu of RCDs for creating a customized plugin.")


#         var RCD_boundaries = JSON.parse(RCD_Boundaries2);
#             return feature.properties.RCDNAME === "Gold Ridge"; //TODO: change to whatever RCD we want


# <datalist id="RCDname">
#     <option value="Boston">
#     <option value="Cambridge">
# </datalist>
