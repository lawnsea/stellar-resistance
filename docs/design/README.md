Stellar Resistance is a grand strategy game about insurgency. You start as the leader of a single small resistance cell on one planet of an oppressive interstellar empire. By recruiting, spreading to new worlds, and allying with or absorbing other resistance groups, you try to grow that cell into a movement strong enough to overthrow the empire.

# High-level design

## Design pillars

- imperfect information: no actors in the game have access to the true game state. instead, each maintains its own perceived gamestate that it updates with new information as it arrives
- emergent simulation: outcomes arise from simulated populations' grievances, loyalties, and willingness to act, not from scripted events
- cost of escalation: violence can radicalize supporters, but it also alienates potential allies and provokes repression
- grounded in research: mechanics draw on scholarship about insurgency, civil war, and resistance movements (see [bibliography](#bibliography))

## Gameplay

- player role: leader of a resistance cell who grows by recruiting, founding cells on other planets, and allying with or absorbing other resistance groups
- core loop: gather intel, plan and assign operations, let the simulation respond, react
- time: discrete turns, each a fixed span of game time. the player pauses, resumes, and changes speed; there is no "end turn" button
- win: overthrow the empire
- loss: the resistance network is destroyed
- audience: grand strategy players (Paradox, Dominions, Shadow Empire)

## Non-goals

- playable empire: the empire is AI-only
- tactical combat: conflicts resolve abstractly
- reflex play: the player can pause at any moment and give orders while paused

## Open questions

- is multiplayer ever in scope?
- what are the exact win and loss conditions, and what does overthrowing the empire mean mechanically?
- how much game time does one turn represent?

# Bibliography

- Baclagon, C. (n.d.). [Andor Through the Lens of Resistance and the Struggle for Power][cbaclagon-andor-thru-lens-of-resistance]. *Medium*.
- Clayton, G., et al. (2011). [The Method Makes the Manuscript: Key Texts in the Theoretical and Methodological Advancement of the Study of Civil War][clayton-et-al-key-texts-in-study-of-civil-war]. *Journal of Intervention and Statebuilding* 5(2).
- Devereaux, B. (2026). [Collections: Against the State – A Primer on Terrorism, Insurgency and Protest][acoup-insurgency]. *A Collection of Unmitigated Pedantry*.
- Kalyvas, S. N., & Kocher, M. A. (2007). [How "Free" Is Free Riding in Civil Wars? Violence, Insurgency, and the Collective Action Problem][kalyvas-kocher-collective-action-problem]. *World Politics* 59(2).
- Kydd, A. H., & Walter, B. F. (2006). [The Strategies of Terrorism][kydd-walter-strategies-of-terrorism]. *International Security* 31(1).
- Paradox Interactive (2021). Stellaris Dev Diaries: [#194 Intel][stellaris-dev-diary-194]; [#196 Redacted][stellaris-dev-diary-196]; [#197 Operations and Assets][stellaris-dev-diary-197]; [#198 Provocations][stellaris-dev-diary-198].
- Pepinsky, T. (2017). [Everyday Authoritarianism is Boring and Tolerable][pepinsky-authoritarianism-is-boring-and-tolerable].
- Ricks, T. E. (2022). [*Waging a Good War: A Military History of the Civil Rights Movement, 1954–1968*][ricks-waging-a-good-war].
- Staniland, P. (2010). [*Explaining Cohesion, Fragmentation, and Control in Insurgent Groups*][staniland-cohesion-in-insurgents]. PhD thesis, MIT.
- Weinstein, J. M. (2007). [*Inside Rebellion: The Politics of Insurgent Violence*][weinstein-inside-rebellion].

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
