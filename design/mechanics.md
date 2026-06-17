# Game Mechanics

## Core architecture

- **Tick model**: attitudes and other leaky values relax toward condition-derived targets each tick; fast/slow time constants differ per axis.

## State

- **Intrinsic vs. perceived state**: each entity has its own intrinsic state plus a perceived world state (beliefs about other entities). No entity directly observes another; all cross-entity knowledge is intel.
- **Intel**: entries keyed per (holder, target, attribute) — a claimed value with a confidence. Knowledge is the special case of (near-)maximal confidence.
- **Accuracy (derived)**: a claim's accuracy is its claimed value compared against the target's true value; only the simulation can derive it — an entity cannot see its own accuracy.
- **Confidence**: the only stored uncertainty, per attribute; rises with corroboration (agreeing claims reinforce, even when wrong), falls with contradiction; a contradiction of comparable credibility collapses the belief to unknown, a stronger one migrates it.

## Attitudes

- **Triple**: every attitude is a fear/militancy/loyalty vector, held toward factions, cultures, and religions.
- **Decay**: fear decays fast, militancy decays slow, loyalty is inertial.
- **Radicalization** (toward a faction) = militancy − fear; fear masks militancy without dissipating it (pressure cooker), so lifting fear reveals accumulated militancy.
- **Initialization**: pop attitudes initialize from the culture's/religion's default vectors on first contact, then diverge through experience.
- **Aggregation**: faction and cell cultural/religious attitudes are aggregated from member pops' attitudes.

## Standard of living & acceptance

- **SoL**: derived from local production/employment/extraction, reduced by low acceptance.
- **Expected SoL**: adapts slowly toward lived SoL; economic grievance keys off (expected − actual), so trajectory matters more than level.
- **Acceptance**: how neighboring pops regard this pop, from their cultural/religious attitudes toward its identity, weighted by neighbor size; self-attitude is 1; low acceptance reduces SoL — linking inter-pop prejudice to material grievance.

## Population

- **Famine self-limiting**: deaths raise survivors' per-capita SoL, relieving the grievance that caused them.
- **Conservation of militancy**: killing pops does not destroy their militancy; it transmits along identity links (martyrdom) rather than vanishing.

## Propagation of violence

- **Source**: an act produces a mood-delta on its victim (severity); witnesses receive attenuated copies.
- **Local witnesses** (same planet): a constant fraction of the victim's delta, reduced by loyalty to the perpetrator, reweighted toward militancy (witnessing radicalizes more than it cows).
- **Remote co-type** (same identity, other planet): as above, further reduced by censorship.
- **Signed by alignment**: the witness's prior attitude toward the victim signs the effect — sympathy with the victim reads the act as atrocity (souring toward the perpetrator's identity), hostility reads it as justice (warming). Violence polarizes along existing fault lines.
- **Targeted by perpetrator**: fear accrues toward the perpetrator, militancy toward the perpetrator's opposition.
- **Collective blame**: a cell's action attributes to the cultures/religions composing it (heaviest) and, less, its faction.
- **Fear unsigned**: proximate fear of nearby violence accrues regardless of approval.
- **Censorship**: masks propagation without dissipating it; withheld potential is stored and released by smuggling, aging via the fast-fear/slow-militancy split.

## Control & territory

- **Per-pop allegiance**: a pop is controlled by the faction holding its loyalty.
- **Force override**: control can be seized against allegiance by force, paid continuously, scaling with the militancy suppressed; coercion is itself a perpetrator-attributed atrocity, raising the militancy that sets its cost.
- **Planet control (derived)**: follows from controlling enough of a planet's pops.
- **Force projection**: routed and rivalrous across planet links; attenuates with distance/contest.
- **Quagmire**: an occupier can win any single engagement but the integral of holding many hostile worlds outruns finite force; breadth beats the occupier; military defeat leaves the support reservoir intact.

## Factions: lifecycle

- **Birth (nucleation)**: when a pop's recruitable radicalized members exceed a threshold with no cheap existing channel, a fraction nucleates into a new faction, seeded with the pop's identity and the target its militancy points at, structured into a handful of cells with a leader and a simple network; game-controlled. Spawning continues until recruitable surplus falls below threshold.
- **Target**: the founding adversary is whichever faction the recruitable militancy points at — may be the empire, a vassal, a rival rebellion, or the player (e.g. a loyalist death squad).
- **Death**: a faction dies when its members' militancy deradicalizes to nothing (reform/time). Suppression by fear does not kill it; military defeat destroys capacity but not support.
- **Decapitation, cell survives**: promote a leader-cell member to directing operative (an operative if available, else upgrade a pop).
- **Decapitation, leader cell emptied**: the faction fragments into connected components of the cell loyalty graph (mutual loyalty among mutually-aware cells above threshold); each component becomes a successor faction choosing a new leader cell. New leaders carry only their own prior awareness; cells known only to the dead leader are shed, each becoming a faction of one. Successors inherit cross-component edges as opening (low/hostile) mutual attitudes.

## Factions: recruitment & growth

- **Reach**: a faction recruits from pops on planets where it has a cell or operative; no presence, no recruitment.
- **Cost**: recruitment cost falls with attitudinal alignment (cheapest from co-identity, co-target, radicalized pops); local consolidation is cheap because fresh recruits are near-identical to remaining recruitable members.
- **Recruiters**: both operatives and cells recruit new cells (operatives serially, one at a time); recruiting costs resources/time and exposes the recruiter.
- **Connectivity**: a new cell is connected to its recruiter only, not to siblings; default topology is a star. Operative-recruited cells form independent roots; cell-recruited cells form subtrees.
- **Mass recruitment**: a cell can recruit pop members into its own ranks (a mob/unit); capability to act depends on resources (e.g. blasters), independent of headcount.
- **Cell upgrade**: a cell member (pop) can be upgraded to an operative (one-way).

## Collaboration & operations

- **Collaboration**: multiple cells may jointly execute an action to concentrate force; participants become mutually aware (lateral edges → decapitation-resilience) at the cost of roll-up surface and correlated exposure.
- **Operations**: a goal decomposed into actions by different cell groups (e.g. recon then assault), stitched through a coordinating node; groups in separate actions stay mutually blind, so operation structure sets the exposure surface.
- **Reporting & command**: cells collect intel and report to the leader cell; the leader directs cells. Both are intel flows that lag and can be intercepted or falsified (a turned/infiltrated cell poisons upward).

## Cells, operatives & secrecy

- **Cell as collector & holder**: intel about anything is received first by a cell, held in its shared perceived world state (pooled from its true pop members, stored on the cell), then reported to the faction.
- **Operative independence**: operatives hold their own perceived world state and share with cells selectively.
- **Covers**: an operative presents a set of false facts (its active cover, possibly empty at a safe haven); the cover writes the cell's perception of the operative, scaled by cover success (tradecraft). The deepest cover is "I'm an ordinary pop" (infiltration of another faction).
- **Infiltration**: a member may be an infiltrator from another faction; the cell perceives it via cover and cannot distinguish cover from truth except through its own (fallible) intel; an embedded infiltrator can read the cell's shared pool.
- **Exposure (derived)**: a faction's existence-exposure is the coverage of attitudes held toward it; a resource's location-exposure is the accuracy/confidence of intel others hold about it. Cell exposure scales with size (mass is inherently overt) and with overt actions; reduced by tradecraft.
- **Liquidity**: the leader cell's credits/resources are the faction's liquid assets; other cells' holdings are illiquid until a leader reallocation action (multi-step, intel-generating, disruptable).

## Actions

- **Commitment**: an action commits members and resources that cannot be reused until it completes.
- **Multi-step**: actions take time; in-progress they expose participants and can be paused, rolled back/sabotaged, interrupted, or defeated.
- **Capacity-building**: factions (including the empire) build new capacity (garrisons, etc.) via multi-step actions, which others can develop intel on and disrupt.

## Intelligence & military effectiveness

- **Two fields**: intel carries accuracy (matches reality, derived) and confidence (belief, stored).
- **Collateral ∝ inaccuracy**: all military action causes collateral (fear + outrage) inverse to the accuracy of the intel it is based on; confidence gates whether/how deeply a faction commits, accuracy gates whether it succeeds.
- **Disinformation**: poisoning lowers an enemy's accuracy; spoofing/false corroboration inflates confidence in inaccurate intel (the low-accuracy/high-confidence atrocity case); smuggling releases censored potential.
- **Interdiction depth**: scales with confidence (delay → sabotage → defeat); success scales with accuracy (a confident strike on a poisoned picture backfires).

## Proficiencies

- **Vector**: a vector of skill levels (e.g. tradecraft) on pops and operatives; cells aggregate members' (derived).
- **Inheritance**: initialized from the culture's defaults (culture → pop → operative), then diverge through experience.
- **Tradecraft**: reduces exposure and improves cover and espionage success.
- **Observation (co-membership)**: each tick, a cell member gains a small fraction toward the max proficiency among the other members, capped at that max, per proficiency.
- **Observation (collaboration)**: an additional small per-tick bump scoped to an action's participants (may cross cells).
- **Training**: a base capability; an entity trains another (or a group) on a chosen proficiency by a larger per-tick fraction of the trainer's level, capped at it; commits trainer and trainees and risks exposure.

## Thesis (enforced by mechanics, not authored)

- Oppression is expensive (force is rented per-tick, coercion cost scales with militancy suppressed) and brittle (suppressed militancy accumulates under fear and surfaces nonlinearly when fear lifts).
- Violence tends to manufacture its opposition (propagation, collective blame, conservation of militancy, collateral-from-bad-intel).
- Only reform and time drain the support reservoir; military defeat, decapitation, and repression destroy capacity while leaving (or deepening) support.
