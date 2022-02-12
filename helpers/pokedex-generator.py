from bs4 import BeautifulSoup
import requests

html = requests.get("https://www.serebii.net/pokemon/nationalpokedex.shtml").text
soup = BeautifulSoup(html, "lxml")

num_pokemon = 802

pokemon_list = soup.find_all("tr")[2:]

json_content = """
[
"""

for pokemon in pokemon_list[:2*num_pokemon-1:2]:
    info = pokemon.find_all("td")
    number = info[0].text.strip()[1:]
    name = info[3].find("a").text
    types = info[4].find_all("a")
    type_1 = types[0]["href"].split('/')[-1]
    type_2 = types[1]["href"].split('/')[-1] if len(types) == 2 else "none"
    speed = info[-1].text
    json_content += f"""
    {{
        "id": "{number}",
        "name": "{name}",
        "type_1": "{type_1}",
        "type_2": "{type_2}",
        "speed": {speed},
        "sprite": "Shuffle{number}.png"
    }}{',' if int(number) < num_pokemon else ''}
    """
json_content += """
]
"""

with open("pokedex.json", "w") as output_file:
    output_file.write(json_content)
