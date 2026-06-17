# Game Entities

Each entity is a list of properties. Properties marked **(derived)** are computed from other state rather than stored.

---

# Pop

**Identity (immutable — defines the bucket)**
- **size**: how many individuals are in the bucket; only ever decreases
- **planet**: where the pop currently is
- **culture**: the pop's culture (a bucket key; carries its own ancestral planet and default attitude vectors)
- **religion**: the pop's religion (a bucket key; carries its own holy planet and default attitude vectors); may be empty
- **origin**: how the pop came to be here (native / settler / conquered)

**Material state**
- **standard of living**: current material condition; derived from local production/employment/extraction, then reduced by low acceptance
- **expected standard of living**: adapts slowly toward lived SoL; economic grievance keys off (expected − actual)
- **acceptance**: how well the other pops local to this pop regard it; derived from those neighbors' cultural and religious attitudes toward this pop's culture/religion, weighted by neighbor size; self-attitude is 1; low acceptance reduces SoL

**Attitudes (each a fear/militancy/loyalty triple; pop-level values initialized from the culture's/religion's default vectors, then diverge through experience)**
- **faction attitudes**: a triple toward each faction the pop has encountered; fear decays fast, militancy decays slow, loyalty is inertial; radicalization toward a faction = militancy − fear
- **cultural attitudes**: a triple toward each culture the pop has encountered; instantiated from this pop's culture's default-toward-that-culture vector on first contact
- **religious attitudes**: a triple toward each religion the pop has encountered; instantiated from this pop's religion's default-toward-that-religion vector on first contact

**Proficiencies**
- **proficiencies**: a vector of skill levels (e.g. tradecraft, discipline), initialized from the culture's defaults, then diverge through experience

**Perceived world state (beliefs about other entities; updated only by received intel)**
- **perceived world state**: entries keyed per (target, attribute), each a claimed value with a confidence; the pop's beliefs about other entities, distinct from its attitudes (a pop may hold false beliefs about a faction it nonetheless has a real attitude toward)

---

# Faction

- **pops**: the pops comprising the faction, each a cell member or operative
- **cells**: planet-local groups of members through which actions are taken
- **operatives**: mobile members who travel between planets and staff cells; created by upgrading a cell member
- **culture/religion composition**: the aggregate identity of the faction's pops (derived)
- **credits**: money spent on actions
- **resources**: objects in the world created by faction actions
- **faction attitudes**: a fear/militancy/loyalty triple toward each other faction encountered
- **cultural/religious attitudes**: a fear/militancy/loyalty triple toward each culture/religion, aggregated from the faction's pops' attitudes (derived)
- **perceived world state**: entries keyed per (target, attribute), each a claimed value with a confidence; the faction's beliefs about other entities, updated only by received intel (chiefly its cells' reports), lagging and fallible
- **popular support**: aggregate support for the faction, from pop attitudes (derived)
- **popular control**: aggregate control over pops, a function of loyalty and fear per pop (derived)

---

# Cell

- **faction**: the faction the cell belongs to
- **planet**: the planet the cell is on
- **leader**: whether this is the faction's leader cell
- **members**: the pops (not deduped) and operatives comprising the cell; may include infiltrators presenting as members
- **cell attitudes**: a fear/militancy/loyalty triple toward each other cell of its faction it is aware of
- **perceived world state**: the cell's beliefs about other entities (per target, attribute: claimed value, confidence)
- **credits**: money held by the cell
- **resources**: objects in the world held by the cell
- **proficiencies**: a vector of skill levels (e.g. tradecraft, discipline), aggregated from the members' proficiencies (derived)
- **capabilities**: the actions the cell can take; a base set (recruit members, recruit cells, basic espionage, train), plus actions added by resources (e.g. weapons add military actions) and by operative members (e.g. call for reinforcements), each further gated by the cell's militancy toward the action's target clearing that action's threshold (derived)
- **culture/religion composition**: the aggregate apparent identity of the members (derived)
- **faction/cultural/religious attitudes**: a fear/militancy/loyalty triple toward each faction/culture/religion encountered, aggregated from members' attitudes (derived); militancy toward an action's target gates which of the cell's capabilities are available, and militancy − fear (of the target) + loyalty (to the cell's own faction) − loyalty (toward the target) sets willingness to use an available one
- **actions**: the actions the cell is currently undertaking; each commits members and resources that cannot be reused until it completes

---

# Operative

- **faction**: the faction the operative belongs to
- **planet**: the planet the operative is currently on
- **origin pop**: the pop the operative was upgraded from; its true identity (culture/religion/origin)
- **cell**: the cell the operative is currently staffing, if any
- **covers**: the set of covers the operative has, each a set of claimed facts presenting a false identity (may include "ordinary pop")
- **active cover**: the cover currently presented; may be empty (e.g. at a safe haven)
- **attitudes**: a fear/militancy/loyalty triple toward each faction, culture, and religion encountered (its true allegiance, distinct from any cover)
- **perceived world state**: the operative's beliefs about other entities (per target, attribute: claimed value, confidence); shared with cells selectively
- **credits**: money carried by the operative
- **resources**: objects carried by the operative
- **proficiencies**: a vector of skill levels (e.g. tradecraft, discipline), initialized from the origin pop's culture defaults, then diverging through experience
- **capabilities**: the actions the operative contributes to a cell (derived)

---

# Planet

- **culture/religion composition**: the pops on the planet, by identity (derived)
- **pops**: the pops currently on the planet
- **production**: local economic output, feeding pop standard of living
- **control**: the controlling faction per pop (allegiance, possibly overridden by force); planet-level control follows from controlling enough of its pops (derived)
- **garrisons/forces**: the military presence projected onto the planet by factions
- **links**: connections to other planets along which travel, trade, force, and contagion flow

# Culture

- **ancestral planet**: where the culture originates; may be the pop's current planet; may be empty (nomadic)
- **default attitudes**: a fear/militancy/loyalty triple toward each other culture, seeding pops' cultural attitudes on first contact
- **default proficiencies**: a vector of skill levels, seeding the proficiencies of pops of this culture

# Religion

- **holy planet**: where the religion originates; may be empty
- **default attitudes**: a fear/militancy/loyalty triple toward each other religion, seeding pops' religious attitudes on first contact

---

# Appendix: referenced but not yet specified

These are referenced by the entities above but not yet decided as first-class entities vs. structures:

- **Action**: a committed, possibly multi-step undertaking by a cell/operative; commits members and resources, has a target, generates intel and exposure, can be paused/sabotaged/interrupted/defeated. Each action type carries a **violence** level setting its minimum militancy requirement — minimal to publish a newspaper, higher to stage a street protest, highest to assassinate. Likely a first-class entity given its state.
- **Resource**: an object in the world (weapons, safehouse, press, cache) held by a cell/faction; adds capabilities. Likely first-class.
- **Intel entry**: a (holder, target, attribute) claim with confidence; accuracy derived against truth. A structure within perceived world state rather than a standalone entity.
- **Cover**: a set of claimed false facts an operative presents; written into observers' perceived world state scaled by tradecraft. A structure on the operative rather than a standalone entity.
