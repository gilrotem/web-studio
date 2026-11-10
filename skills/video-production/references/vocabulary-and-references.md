# Concept vocabulary and references

Background for anyone writing a video concept or extending a site around one. Five
parts: the web-motion genre a rebuilt site sits in, the neighbouring industries to
borrow from, how to choose a craft metaphor for a professional-services brand, where
to look for references, and ready search strings.

In a project, the project's own notes on these (which neighbours fit this client,
which references were found, which strings worked) go in
`docs/video/05-concept-vocabulary-and-references.md`.

The named firms, campaigns and accounts below are carried from the source pack as
it recorded them. They were not re-checked when this file was written. Open each one
before citing it to anybody.

## 1. The web-motion genre: terminology

The reels showing coffee being poured as you scroll, or a building assembling
itself, belong to one family.

**Umbrella terms**

- Scroll-driven animation / scroll-linked animation: animation whose progress is
  tied to scroll position
- Scrollytelling: the storytelling genre built on it
- Immersive / cinematic web design: the aesthetic label
- "Awwwards-style" / "agency site": community shorthand

**Techniques**

- Scroll-scrubbed video (video scrubbing): scroll position is the playhead
- Image sequence scrubbing (canvas sequence): video exported as hundreds of frames,
  drawn to `<canvas>` on scroll; the Apple product-page technique, smoother than a
  real `<video>` element
- Pinning / sticky sections: a section locks while content inside animates through
  states
- Parallax: layers at different speeds
- Horizontal scroll sections
- Scroll-triggered reveals / mask reveals
- Kinetic typography
- Scroll-jacking: pejorative term for overriding native scroll
- Smooth scroll / inertia scroll: library-driven lag-behind feel

**Tooling**

- GSAP ScrollTrigger: industry standard
- Lenis (formerly Locomotive Scroll): smooth scroll layer
- Framer Motion / Motion: React equivalent
- Three.js / WebGL / React Three Fiber: 3D and shaders
- Lottie: After Effects vector animation
- CSS scroll-driven animations (`animation-timeline: scroll()` / `view()`): native,
  no JS
- Webflow interactions / Framer: the no-code tools most reel creators use

**Where a brand video sits in this family.** A brand video made with this skill is a
passive loop, not scroll-driven. But its beats are designed so that they can later
be re-cut as a scroll-scrubbed sequence (stage one, stage two, and on to the finish)
if the site moves to a scrollytelling hero. Keep the beat clips as separate files
for that reason. The kit's `motion-language` skill decides the engine for anything
scroll-driven; `asset-pipeline` has the frame-sequence script.

## 2. Adjacent industries that already get this treatment

Most professional services have no scrollytelling genre of their own. Nobody has
made the reference you are looking for in the client's exact field, so inspiration
comes from neighbours. Find the neighbour by asking **what shape of story the
client's work is**, then look where that shape is already told well.

| The client's work is a story of... | Look at |
|---|---|
| **A map, layers and numbers** (anything about land, property, place, territory) | GIS and map-based scrollytelling (Mapbox and Esri story maps), data journalism (The Pudding, Reuters Graphics, NYT Upshot), urban planning and zoning explainers, parcel and cadastral map interactives |
| **Stages over time** (permits, approvals, any process with phases) | Construction tech, BIM and digital-twin sites, construction timeline animations, architectural visualization process reels |
| **Trust and numbers** (advice, money, risk) | Legaltech, fintech and insurtech landing pages |
| **Precision measurement** | Surveying, drone survey, LiDAR, point clouds: the visual language of exact measuring |

A client usually fits two rows. Write down which two and why, in one line each, in
the project's own vocabulary notes. That line is what turns a pile of saved links
into a direction.

## 3. Choosing a craft metaphor for a professional-services brand

A professional service is invisible work: reading, judging, arguing, deciding. A
craft metaphor gives it hands. It works when it is true and fails when it is only
flattering.

### What makes a craft metaphor work

1. **It must be true of the service, not just pretty.** Write one sentence that
   says what the client's work actually does for its customer (the through-line in
   the brand and client profile). The metaphor has to claim exactly that. If the
   same metaphor could be handed to any firm in any category, it is decoration.
2. **The adjective is dead; the process is not.** Words like "bespoke", "tailored"
   and "highly personal" are so overused in professional services that they no
   longer differentiate. The gestures of a craft still do. Show the gestures, never
   the adjective.
3. **The craft needs a canonical order.** A good craft for this purpose has five to
   seven stages that everyone who practises it performs in the same order, from
   meeting the customer to handing the work over. That order becomes the script.
4. **Its tools must be read in half a second, without sound.** A handful of tools
   that anyone recognises and that say "made for you, by hand, with care" on their
   own.
5. **It must pair cleanly with the client's own objects.** The film puts one craft
   tool and one object of the client's profession in the same frame, in the same
   hands. The client's objects have to be physical and recognisable too: a plan, a
   stamped document, a bound report, a model.
6. **Never show the craft's literal product.** The craft is the metaphor. A finished
   garment, shoe or instrument in the frame turns the film into an advertisement for
   that trade. The thing being made is always the client's deliverable.
7. **Consider the move of looking past it.** One of the references below turned the
   metaphor around: the craft object is what you look past to meet the person. A
   metaphor can be the frame around the people rather than the subject.
8. **It should supply verbs to the copy.** A metaphor that gives the site's language
   a set of concrete process verbs (measure, mark, cut, fit, finish) is doing real
   work beyond the video. Carry it into the copy lightly: section titles, process
   steps, the end-card line. A metaphor that lives only in the pictures is half
   used.

### Crafts worth considering

Each carries the same promise of one piece of work made for one customer:

- **The tailor.** The most familiar; see the labelled example below. Its risk is
  exactly its familiarity.
- **The bespoke shoemaker** and the wooden *last* carved for one foot. Arguably
  sharper than tailoring for any service that builds a model of one specific case.
- **The watchmaker.** Precision, patience, many small parts that must agree.
- **The luthier.** Tuning, listening, an instrument built for one player.
- **The bookbinder.** Ordering, joining, making separate sheets hold as one.
- **The architect's hand drawing.** Not a craft of the hands in the same way, but
  the same promise: drawn for one site.

### Real references

- **Swinburne Maddison (UK law firm):** "Made to measure" brand campaign by Allies
  Group; headlines such as "Made to measure legal solutions" and "Legal services
  tailored to you". The cleanest one-to-one precedent for a tailoring metaphor in a
  professional practice.
- **Bolt Burdon Kemp (UK law firm):** brand by Underscore; the story invited people
  to "meet the individuals behind the suit", and the website concept was built
  around a tailored journey per visitor. Note the move: the suit is what you look
  past, not what you show.
- **Boutique London wealth managers** framed by Spear's as "a Savile Row for
  wealth".
- **A caution from the wealth-management sector:** "bespoke advice" and "highly
  personal service" are so overused they no longer differentiate. The word is dead;
  the *process* of the craft is not. Show the gestures, not the adjective.

### One worked example: tailoring

One craft worked through, as an example of the guidance above. It is an example of
the method, not a default.

When it is true: for a practice whose work is to argue one specific case against a
standard answer that someone else has already set. An off-the-rack answer loses that
kind of argument; a measured, individually cut one wins it. Then the metaphor claims
exactly what the service does. For a practice whose value is speed or scale it is
false, however good it looks.

The craft's stages, as a service grammar:

| Tailoring step | Service equivalent | Idiom / search phrase |
|---|---|---|
| Consultation, cloth selection | intake, scoping | "consultation", discovery |
| Measuring | assessment, due diligence, valuation | "taking the measure of", measuring tape |
| Pattern drafting | strategy, plan | paper pattern, pattern drafting |
| Cutting | decision, defining scope | "cut from a different cloth", shears |
| Basting, first fitting | draft, review round | "first fitting" |
| Finishing, hand-stitching | detail, execution | hand stitch, needle and thread |
| The finished fit | result | "the perfect fit", "fits like a glove" |

**Vocabulary bank (English):** bespoke, made to measure, tailored, cut, fit,
pattern, chalk, canvas, lining, stitch, thread, seam, measure, fitting, craft,
atelier, workshop, Savile Row, haberdashery; idioms: cut from a different cloth, a
good fit, made to measure, taking your measure, no two alike, we don't do
off-the-rack.

**Examples of on-screen text in Hebrew for the same metaphor:** תפור למידה ·
בהתאמה אישית · מדידה · סימון · גזירה · מדידה ראשונה · גימור · תפר · חוט · סרט מידה ·
גיר חייטים · מספריים · סדנה · אטלייה. As lines: לא עובדים מהמדף · כל תיק נמדד מחדש ·
גוזרים את הסטנדרט למידה של המקרה.

Build the same three things for whichever craft a project chooses: the stage table
with its service equivalents, a vocabulary bank in English for searching, and a
short bank of on-screen words and lines in the site's language.

## 4. Where to look for references

- Awwwards, Godly, SiteInspire, Land-book: filter by the client's sector and by the
  neighbours from section 2 (for a place-based service: real estate, architecture,
  data visualization)
- Behance: agency case studies with reasoning, not just visuals
- Dribbble: isometric / blueprint UI style
- Mapbox and Esri story-map galleries: GIS scrollytelling
- The Pudding, Reuters Graphics, NYT Upshot: data storytelling
- D&AD, Transform Awards, Brand Impact Awards: professional-services branding; craft
  metaphors recur
- Ads of the World, Campaign Live: "tailored" campaigns in insurance and banking
- Pinterest: better than Instagram for conceptual metaphors

**Instagram accounts:** @awwwards @godly.website @siteinspire @webflow @framer @gsap
@minimal.gallery @motiondesignschool @the.pudding @reutersgraphics @mapbox @esrigram
@behance @someone_london @pentagram @koto.studio @ragged_edge @howandhow
@studio.dumbar @brandnewarchive

## 5. Ready search strings

**Instagram works on exact hashtags plus loose free text. Pattern: one populated
category hashtag + concept words in free text. Two slots per query, never three.**

**Hashtags, style:** #scrollytelling #scrollanimation #webdesigninspiration
#awwwards #webflowdesign #framerwebsite #gsap #motiondesign #uimotion
#microinteractions #webgl #threejs #interactivedesign #immersiveweb
#landingpagedesign

**Hashtags, subject** (this set is for a land, property or built-environment
subject; swap in the client's sector and its neighbours from section 2):
#archviz #architecturalvisualization #urbanplanning #masterplan #gis #mapdesign
#cartography #datavisualization #infographicdesign #isometricdesign #blueprint
#technicaldrawing #landsurveying #dronesurvey #lidar #pointcloud #bim #digitaltwin
#proptech #constructiontech

**Hashtags, brand and metaphor:** #visualidentity #brandidentity #identitydesign
#brandingdesign #logodesign #brandcampaign combined with #bespoke #tailored
#madetomeasure #craftsmanship #sartorial #atelier

**Free-text, web motion:** scroll animation website architecture · scrollytelling
map · interactive map website design · urban planning website animation · zoning map
motion design · isometric building process · blueprint animation website · technical
drawing reveal animation · construction timeline animation · building stages
animation · drone survey land website · point cloud animation architecture · real
estate website motion design · proptech landing page · data visualization scroll
website

**Free-text, a place-based service as a map story:** layered map animation · parcel
map reveal · cadastral map design · property data visualization · land value map
interactive · heatmap animation website

**Free-text, a process as a time story:** process timeline animation · step by step
scroll animation · approval flow animation · construction phases scroll · document
to building animation · 2D to 3D plan animation

**Free-text, visual metaphors:** exploded view building animation · floor plan to 3D
reveal · paper blueprint unfolding animation · stamp approval animation · wireframe
city animation · site plan drone overlay

**Free-text, craft metaphor** (written for tailoring; swap the tool and material
words for the chosen craft): bespoke visual identity · tailored brand identity ·
made to measure branding · bespoke service branding · tailored service identity ·
bespoke consultancy brand · tailored law firm brand · bespoke advisory identity ·
measuring tape graphic · tailor's chalk mark · pattern paper texture · dressmaker
pins layout · thread spool logo · shears icon · basting stitch illustration · fabric
swatch book design

**Phrase generator:** [concept word] + [service type] + [design deliverable]; use
two of the three slots.

- Concept: bespoke, tailored, made to measure, custom-fit, cut-to-fit, handcrafted,
  one-of-a-kind
- Service type: consultancy, advisory, legal, law firm, real estate, property,
  boutique agency, private practice, concierge, wealth
- Deliverable: visual identity, brand identity, branding, logo, brand campaign,
  website design, landing page

**Shortcut:** find one good post, open its hashtags, follow the ones under about
200k posts. Mid-size tags are where studio work lives.
