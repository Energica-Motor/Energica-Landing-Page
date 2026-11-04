'use strict';
// Maker reference prices checked 27 October 2026. No live inventory or checkout.
const curatedProducts = [
  {
    id: 'magliano-panenka', name: 'Magliano × VEJA Panenka Titanium', maker: 'MAGLIANO × VEJA',
    category: 'Style', price: 220, currency: 'EUR', tag: 'DESIGN COLLABORATION', image: 'magliano',
    detail: 'A football-inspired leather sneaker, reinterpreted by Magliano and VEJA. A fold-over tongue and interchangeable laces bring a playful finish to the Titanium colourway.',
    spec: 'Made in Brazil. Choose your size and confirm current availability with Magliano.',
    url: 'https://magliano.website/products/magliano-x-veja-panenka-titanium',
    keywords: 'magliano veja panenka titanium sneaker shoes footwear'
  },
  {
    id: 'microduck', name: 'Microduck', maker: 'POLLEN ROBOTICS',
    category: 'Robotics', price: 399, currency: 'USD', tag: 'OPEN-SOURCE PLAY', image: 'microduck',
    detail: 'A small biped with a big personality. This 25 cm robot comes with playable behaviours and an open-source stack for teaching it new moves in simulation and the real world.',
    spec: 'Maker pre-order reference: US$399 before tax and shipping. Colour, delivery timing and eligible destinations are confirmed by Pollen Robotics.',
    url: 'https://pollen-robotics.com/microduck/', shopUrl: 'https://store.pollen-robotics.com/products/microduck', shopLabel: 'Pre-order with maker',
    keywords: 'microduck pollen duck biped robot'
  },
  {
    id: 'giusti-extravecchio', name: 'Modena DOP Balsamic · 25 years', maker: 'GIUSTI 1605',
    category: 'Food & wine', price: 129, currency: 'EUR', pricePrefix: 'From ', tag: '25-YEAR EXTRAVECCHIO', image: 'balsamic',
    detail: 'Aceto Balsamico Tradizionale di Modena DOP Extravecchio. Cooked grape must, aged for at least 25 years through successive small wooden barrels. A few drops for the table.',
    spec: '100 ml. Contains sulphites. Select the presentation and confirm the current price with Giusti.',
    url: 'https://giusti.com/it/products/aceto-balsamico-tradizionale-modena-dop-extravecchio',
    keywords: 'giusti balsamic vinegar aceto modena dop 25 extravecchio'
  },
  {
    id: 'brato-jacket', name: 'Giorgio Brato Leather Jacket', maker: 'GIORGIO BRATO',
    category: 'Style', price: 1148, currency: 'EUR', tag: 'ITALIAN LEATHER', image: 'brato-jacket', imageFit: 'cover',
    detail: 'A Perfecto silhouette in reverse vegetal leather, with an asymmetric zip and zipped pockets and cuffs. An everyday wardrobe piece with Giorgio Brato’s distinctive texture.',
    spec: 'Style GUE26S7242VREV. Slate or Nero; sizes 48–56 listed by the maker. Check stock and sizing. Fashion garment; no motorcycle protective rating is claimed.',
    url: 'https://giorgiobrato.it/en/store/products/leather-jacket-82-92', shopLabel: 'Check with maker',
    keywords: 'giorgio brato jacket leather perfecto'
  },
  {
    id: 'lussino-4080', name: 'Lello 4080 Musso Lussino', maker: 'MUSSO',
    category: 'Italian devices', price: null, priceLabel: 'Check regional price', tag: 'GELATO AT HOME', image: 'lussino',
    detail: 'The stainless-steel ice cream maker for a proper gelato ritual at home. The Lussino 4080 pairs an integrated compressor with a compact countertop form.',
    spec: 'Also sold as the Musso Mini Lussino 4080. Regional versions differ: confirm voltage, plug, warranty and delivery before ordering.',
    url: 'https://musso-icecream-machines.com/en/products/musso-mini-gelato-maker', shopLabel: 'View regional options',
    keywords: 'lello musso lussino 4080 ice cream gelato maker'
  },
  {
    id: 'warhol-knives', name: 'Andy Warhol IX Knives Black', maker: 'RETROSUPERFUTURE',
    category: 'Accessories', price: 259, currency: 'EUR', tag: 'THE WARHOL EDIT', image: 'warhol',
    detail: 'Sunglasses created with The Andy Warhol Foundation for the Visual Arts. A contemporary interpretation of a frame Warhol wore in the 1960s, finished in black.',
    spec: 'Model IR4J. Confirm fit, lens details and availability on the original product page.',
    url: 'https://retrosuperfuture.com/collections/andy-warhol-featured/products/ir4j',
    keywords: 'andy warhol retrosuperfuture sunglasses eyewear knives ir4j'
  },
  {
    id: 'unitree-g1', name: 'Unitree G1', maker: 'UNITREE ROBOTICS',
    category: 'Robotics', price: 13500, currency: 'USD', pricePrefix: 'From ', tag: 'HUMANOID ROBOTICS', image: 'g1',
    detail: 'A compact humanoid platform for exploring embodied intelligence. The G1 combines articulated movement with depth-camera and LiDAR sensing; capabilities vary by configuration.',
    spec: 'Maker base reference: US$13,500 excluding tax and shipping. G1 EDU development configurations are quoted separately. Confirm model, support and operating requirements with Unitree.',
    url: 'https://www.unitree.com/g1/', shopLabel: 'Explore & enquire',
    keywords: 'unitree g1 humanoid robot'
  },
  {
    id: 'parmigiano-60', name: 'Parmigiano Reggiano DOP · 5 years', maker: 'ITALIAN PANTRY · GOURM.IT SELECTION',
    category: 'Food & wine', price: null, priceLabel: 'Whole-wheel enquiry', tag: '60-MONTH WHOLE WHEEL', image: 'parmigiano',
    detail: 'A whole wheel of Parmigiano Reggiano DOP matured for 60 months. Deep flavour and a crystalline texture, chosen for a generous table or a very special gift.',
    spec: 'Five-year maturation. Whole-wheel weight, dairy, current stock and delivery require confirmation with the supplier. Contains milk.',
    url: 'https://www.gourm.it/en/1550-pdo-60-months-parmigiano-reggiano/', shopLabel: 'Enquire with supplier',
    keywords: 'parmigiano reggiano parmesan cheese wheel 60 month five 5 year dop'
  },
  {
    id: 'bialetti-moka', name: 'Bialetti Moka Express', maker: 'BIALETTI',
    category: 'Italian devices', price: 38.49, currency: 'USD', pricePrefix: 'From ', tag: 'THE DAILY RITUAL', image: 'bialetti',
    detail: 'The octagonal stovetop coffee maker that turns a few unhurried minutes into an Italian morning ritual. Explore the classic Moka in the size that suits your table.',
    spec: 'Reference price from the US store; size and colour affect pricing. Select 3-cup, 6-cup or another size with the maker. Moka cups refer to small coffee servings.',
    url: 'https://www.bialetti.com/us_en/moka-pot-3-cup-6-cup-italian-stovetop-1.html',
    keywords: 'bialetti moka express pot coffee espresso'
  },
  {
    id: 'petoi-opencat', name: 'Petoi Bittle X · OpenCat', maker: 'PETOI',
    category: 'Robotics', price: 319, currency: 'USD', pricePrefix: 'From ', tag: 'BUILD. CODE. PLAY.', image: 'petoi',
    detail: 'A programmable robot dog built on the OpenCat lineage. Explore quadruped motion, teach new behaviours and make a small robot your next hands-on project.',
    spec: 'Bittle X is the purchasable hardware example. The supplied OpenCat repository supports legacy NyBoard hardware; current Bittle X hardware uses OpenCatESP32. Check kit contents with Petoi.',
    url: 'https://github.com/PetoiCamp/OpenCat-Quadruped-Robot', shopUrl: 'https://www.petoi.com/products/petoi-robot-dog-bittle-x-voice-controlled', sourceLabel: 'OpenCat on GitHub',
    keywords: 'petoi opencat bittle nybble quadruped robot dog cat'
  },
  {
    id: 'brato-backpack', name: 'Giorgio Brato Leather Backpack', maker: 'GIORGIO BRATO',
    category: 'Accessories', price: 1008, currency: 'EUR', tag: 'EVERYDAY CARRY', image: 'brato-backpack', imageFit: 'cover',
    detail: 'A generous suede calf-leather backpack with a squared cover. Giorgio Brato’s material-led design, ready for a day in the city or the journey beyond it.',
    spec: 'Style BSE26S2400BCSD. H50 × W36 × D20 cm. Torba or Nero listed by the maker; confirm colour and stock.',
    url: 'https://giorgiobrato.it/en/store/products/leather-backpack', shopLabel: 'Check with maker',
    keywords: 'giorgio brato backpack leather bag carry'
  },
  {
    id: 'lambrusco-modena', name: 'Vecchia Modena Lambrusco', maker: 'CHIARLI · MODENA',
    category: 'Food & wine', price: null, priceLabel: 'Enquire with producer', tag: 'FROM MODENA', image: 'lambrusco',
    detail: 'Lambrusco di Modena DOC from Chiarli, made with Sorbara grapes. A fresh, lightly sparkling expression of Modena, selected for the table and the people around it.',
    spec: 'Producer example. Confirm bottle, vintage, price and delivery with the seller. Alcohol sales are subject to local legal age and delivery rules.',
    url: 'https://www.chiarli.it/en/chiarli-modena/wines/vecchia-modena-0000459.html', shopLabel: 'View producer',
    keywords: 'lambrusco chiarli vecchia modena wine bottle'
  },
  {
    id: 'openexo', name: 'OpenExo', maker: 'OPENEXO · NORTHERN ARIZONA UNIVERSITY',
    category: 'Robotics', price: null, priceLabel: 'Research project enquiry', tag: 'OPEN-SOURCE RESEARCH', image: 'openexo', imageFit: 'cover', kind: 'project',
    detail: 'An open-source modular exoskeleton platform, bringing mechanical designs, electronics and software together for wearable-robotics research. Explore the project and discuss research parts or builds with its team.',
    spec: 'Research platform, not a ready-to-wear retail device. OpenExo states it is not FDA-approved and is not intended for personal, medical or commercial use.',
    url: 'https://github.com/naubiomech/OpenExo', shopUrl: 'https://theopenexo.nau.edu/make-your-exo/', shopLabel: 'Explore research options', sourceLabel: 'OpenExo on GitHub',
    keywords: 'openexo exoskeleton wearable research biomech'
  }
].map(p => ({kind: 'selected', ...p, image: 'assets/collections/' + p.image + '.webp'}));
