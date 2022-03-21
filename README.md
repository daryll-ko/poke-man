# Poké-Man

![pokeman-demo](/images/poke-man-demo.png)

Poké-Man is [Pac-Man](https://en.wikipedia.org/wiki/Pac-Man), but with Pokémon!

This is Version 1 of the game, created using plain HTML, CSS, and JavaScript.

Version 2 will be built using Sass and TypeScript.

## Dev Stories

- One of the longest time drains (well, it was just a few minutes, but still) was from not realizing that my `index.js` file should have been at the last section inside my `<body>` tags.

- The maze was generated using randomized depth-first-search. I do have plans on including other [maze generation algorithms](https://en.wikipedia.org/wiki/Maze_generation_algorithm) in future iterations. I wanted the borders to be accessible, so I generated the inner section first before naively plopping a bunch of bridges between the inner section and the borders.

- Each chaser takes on one of two strategies at random:

  - Move randomly.
  - Move to the cell with the least [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry) to where your Poké-Man is.

  Both are pretty suboptimal. I plan on throwing in [Floyd-Warshall](https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm) in a future iteration to make the chasers competent, but this'll do for now.

- It's a small thing, but I really like the progress bar. A few lines of JavaScript can really do neat things with CSS!

## Reflections

This is my first project! :D

I've always wondered when I would come up with one. The whole concept of a coding project has been really nebulous to me, as someone who's never gotten their hands into one (at least, not of this scale).

Like with most things, I wish I'd started earlier. Motivation isn't really my bottleneck when it comes to getting things done: you can check out [my competitive programming repo](https://github.com/daryll-ko/recreational) to see that. I think it was more on finding **inspiration** for a project.

I would say that the vast majority of time I've spent on games was spent on [Pokémon](https://en.wikipedia.org/wiki/Pok%C3%A9mon_(video_game_series)) games. I've played through the main series games and they were great (especially *Legends: Arceus*; what a masterpiece!), but the games in which I had the most fun were the **spin-offs** (Ranger, Conquest, GO, etc.).

The first version of this project was a run-of-the-mill Pac-Man game, but remembering the Pokémon games that sprinkled fun across my life journey made me find something worth working towards.

I could ponder on the past for hours on end, but what ultimately matters is where I'm at now, and I'm happy to say that I finally feel like I'm on the side where the grass is greener.
