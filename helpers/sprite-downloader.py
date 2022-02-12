from bs4 import BeautifulSoup
import requests
import re

numbers = [f"{i:03}" for i in range(1, 803)]


def download_file(url):
    image_file = f"pokemon/{url.split('/')[-1]}"
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(image_file, 'wb') as file_output:
            for chunk in response:
                file_output.write(chunk)


for number in numbers:
    html = requests.get(f"https://archives.bulbagarden.net/wiki/File:Shuffle{number}.png").text
    soup = BeautifulSoup(html, "lxml")

    link = soup.find_all("a", href=re.compile(f"https://archives.bulbagarden.net/media/upload/.*"))[0]
    download_file(link["href"])
