# High-level design

## Vision

Stellar Resistance is a grand strategy game about insurgency. You start as the leader of a single small resistance cell on one planet of an oppressive interstellar empire. By recruiting, spreading to new worlds, and allying with or absorbing other resistance groups, you try to grow that cell into a movement strong enough to overthrow the empire.

## Design pillars

### Emergent simulation

Outcomes come from simulated populations rather than scripted events. Each population has its own grievances, loyalties, and willingness to act. The resistance's fortunes rise and fall with how those populations respond to the empire's rule and to the resistance's own actions. This includes the uncomfortable fact that most people under an authoritarian regime simply get on with their lives ([Pepinsky][pepinsky-authoritarianism-is-boring-and-tolerable]).

### Intel & deception

The player never sees the whole board. What you know about the empire, other resistance groups, and even your own cells comes from intel that may be incomplete, stale, or deliberately false. Gathering, protecting, and manipulating information is central to play (see the Stellaris intel and operations dev diaries: [194][stellaris-dev-diary-194], [196][stellaris-dev-diary-196], [197][stellaris-dev-diary-197], [198][stellaris-dev-diary-198]).

### Cost of escalation

Violence is a tool with real costs. Escalating can radicalize supporters, but it can also alienate potential allies and provoke repression that falls on the populations the resistance depends on. The game should make the choice between nonviolent and violent strategies a meaningful one ([Kydd & Walter][kydd-walter-strategies-of-terrorism], [Ricks][ricks-waging-a-good-war]).

### Grounded in research

Mechanics draw on scholarship about insurgency, civil war, and resistance movements, including collective action, insurgent cohesion, and recruitment ([Kalyvas & Kocher][kalyvas-kocher-collective-action-problem], [Staniland][staniland-cohesion-in-insurgents], [Weinstein][weinstein-inside-rebellion], [Clayton et al.][clayton-et-al-key-texts-in-study-of-civil-war], [ACOUP][acoup-insurgency]). Fiction such as *Andor* informs tone ([Baclagon][cbaclagon-andor-thru-lens-of-resistance]). Where the research and fun conflict, the tradeoff should be deliberate and documented.

## Player role

The player is the leader of a resistance cell, not an abstract, all-seeing faction. The player's reach grows by:

- recruiting new members
- founding new cells on other planets
- allying with, or absorbing, other resistance groups

## Core loop

1. Gather intel on the empire, local populations, and other groups.
2. Plan operations and assign cells and members to them.
3. The simulation advances: operations resolve, populations' attitudes shift, and the empire responds.
4. React to the results, then repeat.

## Time

The game advances in discrete turns, each representing a fixed span of game time. As in Paradox grand strategy games, the player pauses, resumes, and changes speed. There is no "end turn" button, so pausing is how the player stops to think and give orders.

## Win and loss

- **Win:** overthrow the empire.
- **Loss:** the resistance network is destroyed.

The exact conditions for both are open questions.

## Audience

Grand strategy players who are comfortable with deep systems and a steep learning curve, such as fans of Paradox games, Dominions, and Shadow Empire.

## MVP scope

The first milestone, **MVP: Planet viewer**, is a technical vertical slice with no gameplay yet. It covers this design doc, the architecture and stack docs, a working dev environment, a minimal Planet entity, and a UI for browsing planets.

## Non-goals

- **Playable empire:** the empire is AI-controlled only.
- **Tactical combat:** conflicts resolve abstractly, with no battle maps.
- **Reflex play:** the player can pause at any moment and issue orders while paused.

## Open questions

- Is multiplayer in scope at any point?
- What are the precise win and loss conditions?
- What does "overthrowing the empire" mean mechanically?
- How much game time does one turn represent?

# Bibliography
[acoup-insurgency]: https://acoup.blog/2026/02/13/collections-against-the-state-a-primer-on-terrorism-insurgency-and-protest/
[cbaclagon-andor-thru-lens-of-resistance]: https://medium.com/@cbaclagon/andor-through-the-lens-of-resistance-and-the-struggle-for-power-5ef5dd4adfde
[clayton-et-al-key-texts-in-study-of-civil-war]: https://kar.kent.ac.uk/37660/1/Clayton%20et%20al%20Review%20SB.pdf
[kalyvas-kocher-collective-action-problem]: https://www.cambridge.org/core/services/aop-cambridge-core/content/view/EAAA891D5C9D591089EAA9705A6021D6/S0043887100020785a.pdf/how-free-is-free-riding-in-civil-wars-violence-insurgency-and-the-collective-action-problem.pdf
[kydd-walter-strategies-of-terrorism]: https://www.belfercenter.org/sites/default/files/pantheon_files/files/publication/is3101_pp049-080_kydd_walter.pdf
[pepinsky-authoritarianism-is-boring-and-tolerable]: https://tompepinsky.com/2017/01/06/everyday-authoritarianism-is-boring-and-tolerable/
[ricks-waging-a-good-war]: https://www.goodreads.com/en/book/show/59808602-waging-a-good-war
[staniland-cohesion-in-insurgents]: https://dspace.mit.edu/entities/publication/2222c13a-ca8b-4298-97ae-cd7453253847
[stellaris-dev-diary-194]: https://forum.paradoxplaza.com/forum/developer-diary/stellaris-dev-diary-194-intel.1445955/
[stellaris-dev-diary-196]: https://forum.paradoxplaza.com/forum/developer-diary/stellaris-dev-diary-196-redacted.1452177/
[stellaris-dev-diary-197]: https://forum.paradoxplaza.com/forum/developer-diary/stellaris-dev-diary-197-operations-and-assets.1453138/
[stellaris-dev-diary-198]: https://forum.paradoxplaza.com/forum/developer-diary/stellaris-dev-diary-198-provocations.1454011/
[weinstein-inside-rebellion]: https://www.goodreads.com/en/book/show/837001.Inside_Rebellion
