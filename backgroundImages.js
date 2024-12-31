const backgroundImages = {
    1: '5-dots.jpg',
    2: 'BTC.png',
    3: 'a80s-trunks.gif',
    4: 'acer.gif',
    5: 'adobe.jpg',
    6: 'adobe2.jpg',
    7: 'aerial-wallpaper-in-moss.jpg',
    8: 'afx-skyrim.gif',
    9: 'andesite-porphyry.jpg',
    10: 'animal-black-vinyl.jpg',
    11: 'animal-green-vinyl.jpg',
    12: 'arthur-wilcock-wildflower-fabric.jpg',
    13: 'asphalt2.jpg',
    14: 'autumn-butterflies.gif',
    15: 'autumn-leaves.jpg',
    16: 'bamboo-side-pressed-sheet.jpg',
    17: 'bamboo.gif',
    18: 'bananas.png',
    19: 'basalt-stack.jpg',
    20: 'battle-royale.gif',
    21: 'beachy.gif',
    22: 'beanstalk.png',
    23: 'bembridge-antique-staggered-traditional-brick-and-stone-gvsqke.jpg',
    24: 'birds-eye-maple.jpg',
    25: 'bitcoin-orange.png',
    26: 'blonde-carpet.jpg',
    27: 'blue-checkered-cotton-textile.jpg',
    28: 'blue-lotus.gif',
    29: 'blue-majolica-tile-stack.jpg',
    30: 'blue-rings.gif',
    31: 'blue-tile-snowflake.jpg',
    32: 'blue-tile-stack.jpg',
    33: 'blue-tile-star-and-cross.jpg',
    34: 'blundell-staggered.jpg',
    35: 'blush-london-plane.jpg',
    36: 'bones-leather.gif',
    37: 'bones.gif',
    38: 'botany-wallpaper-in-dawn.jpg',
    39: 'breeze.gif',
    40: 'bronze.jpg',
    41: 'brushed-brass.jpg',
    42: 'brushed-concrete.jpg',
    43: 'brussels-carpet.jpg',
    44: 'buff-common.jpg',
    45: 'buff-flemish.jpg',
    46: 'burlap-fabric.jpg',
    47: 'calacatta-gold.jpg',
    48: 'calacatta-vena-hexagonal.jpg',
    49: 'calacatta-vena-marble.jpg',
    50: 'calacatta-vena-stack.jpg',
    51: 'cannage-wallpaper-in-dusk.jpg',
    52: 'carnet-de-voyage-pistachio-green.jpg',
    53: 'cartographer.png',
    54: 'cellar-heat.gif',
    55: 'chamfered-green-tile-stack.jpg',
    56: 'charcoal-carpet.jpg',
    57: 'charcoal-fabric.jpg',
    58: 'charcoal-fabric2.jpg',
    59: 'charcoal-fabric3.jpg',
    60: 'charcoal-walnut.jpg',
    61: 'charred-timber.jpg',
    62: 'cheap_diagonal_fabric.png',
    63: 'checkerboard-cross.jpg',
    64: 'chess-board-weave.jpg',
    65: 'chevron-fabric.jpg',
    66: 'chicken.png',
    67: 'chiselled-plaster.jpg',
    68: 'chocolate-oak.jpg',
    69: 'christmas-black.png',
    70: 'christmas-colour.png',
    71: 'chrysanthemum-and-artichoke-wallcovering.jpg',
    72: 'circle-blues.jpg',
    73: 'circles-dark.png',
    74: 'cloudy-day.png',
    75: 'cmu-block.jpg',
    76: 'colazzo-terrazzo-basketweave.jpg',
    77: 'compressed-hemp-sheet.jpg',
    78: 'congruent_outline.png',
    79: 'congruent_pentagon.png',
    80: 'connectwork.png',
    81: 'corduroy.jpg',
    82: 'cork-and-rubber-composite.jpg',
    83: 'cork-board.jpg',
    84: 'cork.jpg',
    85: 'corrugated-dark-matte-powder-coated-metal.jpg',
    86: 'corrugated-rusted-iron.jpg',
    87: 'corten-steel-b2.jpg',
    88: 'corten-steel-c.jpg',
    89: 'corten-steel.jpg',
    90: 'cotton-canvas.jpg',
    91: 'crazing-tile-triangle.jpg',
    92: 'crazing-tile-variable-hexagon.jpg',
    93: 'crossline-dots.png',
    94: 'crossline-lines.png',
    95: 'dark-grey-terrazzo.png',
    96: 'dark-honeycomb.png',
    97: 'dark-husk-coffee-waste-surface.jpg',
    98: 'dark-paths.png',
    99: 'dark-tile.gif',
    100: 'darkness.png',
    101: 'darney-sandstone-brick-stretcher.jpg',
    102: 'demountable-ceiling-tile-stack.jpg',
    103: 'dense-rattan.jpg',
    104: 'dense-rattan2.jpg',
    105: 'dense-rattan3.jpg',
    106: 'diagonal_striped_brick.png',
    107: 'distressed-leather.jpg',
    108: 'distressed-leather2.jpg',
    109: 'dog.png',
    110: 'doodles.png',
    111: 'dotted-fabric.jpg',
    112: 'dotted-fabric2.jpg',
    113: 'double-bubble-dark.jpg',
    114: 'douglas-fir-staggered.jpg',
    115: 'douglas-fir.jpg',
    116: 'douglas-select-staggered.jpg',
    117: 'drag-textured-plaster.jpg',
    118: 'drill-marked-granite-drystone.jpg',
    119: 'dynamic-style.png',
    120: 'earth-blonde-sandstone.jpg',
    121: 'earth-red-toned-rammed.jpg',
    122: 'earth-tone-barcode-carpet-stack.jpg',
    123: 'earth-tone-barcode-carpet.jpg',
    124: 'earth-with-foliage.jpg',
    125: 'eelgrass-acoustic-mat.jpg',
    126: 'egat-143-terrazzo.jpg',
    127: 'egr-verde-estremoz-terrazzo.jpg',
    128: 'email-pattern.png',
    129: 'embossed-diamond.png',
    130: 'embossed-plaster.jpg',
    131: 'ep_naturalblack.png',
    132: 'ep_naturalwhite.png',
    133: 'evolve-copper-bau-tile-herringbone.jpg',
    134: 'excinere-e-stack.jpg',
    135: 'exotic-floral-textile.jpg',
    136: 'exposed-aggregate-stack.jpg',
    137: 'exposed-aggregate.jpg',
    138: 'expressive-herringbone.jpg',
    139: 'f45-caliber.gif',
    140: 'factory-window.jpg',
    141: 'fancy-cushion.png',
    142: 'felt.jpg',
    143: 'fine-bush-hammered-limestone.jpg',
    144: 'fine-textured-plastic-2000-mm-architextures.jpg',
    145: 'fine-weave-fabric.jpg',
    146: 'finnish-grey-brick-common.jpg',
    147: 'flagstone-ashlar.jpg',
    148: 'flagstone-crazy-paving.jpg',
    149: 'flagstone-rounded-rubble.jpg',
    150: 'flagstone2.jpg',
    151: 'floor-tile.png',
    152: 'flourish-wallpaper-in-birch.jpg',
    153: 'flourish-wallpaper-in-coast.jpg',
    154: 'flourish-wallpaper-in-moss.jpg',
    155: 'flourish-wallpaper-in-pink-cove.jpg',
    156: 'flourish-wallpaper-in-rose.jpg',
    157: 'fluted-concrete.jpg',
    158: 'foggy_birds.png',
    159: 'folk-pattern-black.png',
    160: 'folk-pattern.png',
    161: 'food.png',
    162: 'footer_lodyas.png',
    163: 'forma-piranesi.jpg',
    164: 'fruit-salad.gif',
    165: 'full-bloom.png',
    166: 'funky-lines.png',
    167: 'fur.jpg',
    168: 'gaming-pattern.png',
    169: 'geometric-blue-embroidery.jpg',
    170: 'geometric-carpet.jpg',
    171: 'geometric-grey-embroidery.jpg',
    172: 'geometric-leaves.jpg',
    173: 'geometric-rayon-textile.jpg',
    174: 'giftly.png',
    175: 'gold.jpg',
    176: 'granite-bowtie-pavers.jpg',
    177: 'granite-crazy-paving.jpg',
    178: 'granite-european-fan.jpg',
    179: 'granite-rounded-rubble.jpg',
    180: 'granite-stack.jpg',
    181: 'granite-stack2.jpg',
    182: 'granite.jpg',
    183: 'granite1.jpg',
    184: 'granite2.jpg',
    185: 'granite3.jpg',
    186: 'graphical-natural-jacquard.jpg',
    187: 'graphical-natural-texture.jpg',
    188: 'graphical-white-jacquard.jpg',
    189: 'grass.jpg',
    190: 'grass2.jpg',
    191: 'gravel.jpg',
    192: 'gravel.png',
    193: 'green-crazing-tile-leaf-pattern.jpg',
    194: 'green-deco.gif',
    195: 'green-marble2.jpg',
    196: 'green_cup.png',
    197: 'green_dust_scratch.png',
    198: 'grey-oxford-weave.jpg',
    199: 'grey_wash_wall.png',
    200: 'greyfloral.png',
    201: 'groovy-semi-circles.jpg',
    202: 'grumpyCat.png',
    203: 'h01l-oliva-stretcher.jpg',
    204: 'halfmoon-wallpaper-in-dawn.jpg',
    205: 'halfmoon-wallpaper-in-dusk.jpg',
    206: 'halftone-yellow.png',
    207: 'hardwood-plywood.jpg',
    208: 'heather-blooms-burgundy.jpg',
    209: 'hemspan-bio-board.jpg',
    210: 'hemspan-bio-wall.jpg',
    211: 'heron.jpg',
    212: 'hoose-wallpaper-in-pink-granite.jpg',
    213: 'horton.gif',
    214: 'houndstooth-fabric.jpg',
    215: 'hyacinth-weave.jpg',
    216: 'hyacinth-weave2.jpg',
    217: 'hypnotize.png',
    218: 'ignasi_pattern_s.png',
    219: 'in-situ-concrete-stretcher.jpg',
    220: 'in-situ-concrete.jpg',
    221: 'industrial-brick-common.jpg',
    222: 'interlaced.png',
    223: 'inverna-terrazzo.jpg',
    224: 'ivory-cedar--walnut.jpg',
    225: 'jungle-wallpaper-in-dusk.jpg',
    226: 'just-waves.png',
    227: 'k-briq-heriot-mustard-herringbone.jpg',
    228: 'large_leather.png',
    229: 'larvikite.jpg',
    230: 'larvikite2.jpg',
    231: 'lava-rock.gif',
    232: 'leather.jpg',
    233: 'leather2.jpg',
    234: 'leaves-blue-dimout.jpg',
    235: 'leaves-multicoloured-print.jpg',
    236: 'leaves-natural-dimout.jpg',
    237: 'leaves-pattern.png',
    238: 'leaves-white-dimout.jpg',
    239: 'leaves-white-sheer.jpg',
    240: 'leaves.png',
    241: 'lemon-textile.jpg',
    242: 'let-there-be-sun.jpg',
    243: 'level-loop-pile.jpg',
    244: 'liberty-and-company-tulip-fabric.jpg',
    245: 'light-grey-terrazzo.png',
    246: 'light-veneer.png',
    247: 'lightning-BBG.png',
    248: 'lightning-WBG.png',
    249: 'lightning.png',
    250: 'lilypads.png',
    251: 'limestone-corfiot.jpg',
    252: 'limestone-crazy-paving.jpg',
    253: 'limestone-cubic.jpg',
    254: 'limestone.jpg',
    255: 'limestone2.jpg',
    256: 'loop-pile-carpet-hexagonal.jpg',
    257: 'loop-pile-carpet-staggered.jpg',
    258: 'loop-pile-carpet.jpg',
    259: 'loop-pile-carpet2.jpg',
    260: 'loop-pile-carpet3.jpg',
    261: 'low_contrast_linen.png',
    262: 'lundhs-blue.jpg',
    263: 'majesty-eucalyptus-stretcher.jpg',
    264: 'marble.jpg',
    265: 'marble1.jpg',
    266: 'marmoreal.jpg',
    267: 'matte-hexagonal.jpg',
    268: 'matting.jpg',
    269: 'memphis-colorful.png',
    270: 'memphis-mini.png',
    271: 'microcement.jpg',
    272: 'mirage-wallpaper-in-dawn.jpg',
    273: 'mischievous-jungle-lush.jpg',
    274: 'mixed-tiles-stack.jpg',
    275: 'mondo-grass.jpg',
    276: 'mono-terrazzo.jpg',
    277: 'montauk-daisy.jpg',
    278: 'more-leaves-on-green.jpg',
    279: 'moroccan-flower-dark.jpg',
    280: 'moroccan-flower.jpg',
    281: 'mosaic.png',
    282: 'moss.jpg',
    283: 'moss2.jpg',
    284: 'mr-chipboard.jpg',
    285: 'multi-loop-pile.jpg',
    286: 'nevis-vinyl.jpg',
    287: 'nice_snow.png',
    288: 'nolli-terrazzo.jpg',
    289: 'oak-herringbone.jpg',
    290: 'oak-stack.jpg',
    291: 'oak-stretcher.jpg',
    292: 'oak1.jpg',
    293: 'oatmeal-loop-pile-carpet-cubic.jpg',
    294: 'oatmeal-loop-pile-carpet-hexagonal.jpg',
    295: 'oatmeal-loop-pile-carpet.jpg',
    296: 'old_map.png',
    297: 'olive-striped-textile.jpg',
    298: 'olive-wood-rosette.jpg',
    299: 'ombra-terrazzo.jpg',
    300: 'orange-marble-hexagonal.jpg',
    301: 'orange-marble.jpg',
    302: 'orange-marble2.jpg',
    303: 'oriental-tiles.jpg',
    304: 'oriental.png',
    305: 'oriented-strand-board-osb.jpg',
    306: 'ornamental-white-velvet.jpg',
    307: 'osb-black.jpg',
    308: 'osb-staggered.jpg',
    309: 'osb.jpg',
    310: 'osb3.jpg',
    311: 'oscuro-terrazzo.jpg',
    312: 'ostrich-orange-BG.png',
    313: 'ostrich-purple-BG.png',
    314: 'ostrich-white-BG.png',
    315: 'painted-cmu-block.jpg',
    316: 'painted-reclaimed-timber-staggered.jpg',
    317: 'palm-leaf.png',
    318: 'panda-madness.gif',
    319: 'papyrus.png',
    320: 'patina.jpg',
    321: 'patinated-copper-hexagonal.jpg',
    322: 'patinated-copper.jpg',
    323: 'peacock-glazed-tiles-stretcher.jpg',
    324: 'pebbledash.jpg',
    325: 'perforated-metal.jpg',
    326: 'perforated_white_leather.png',
    327: 'pewter-no-chip.jpg',
    328: 'photography.png',
    329: 'pigmented-concrete.jpg',
    330: 'pilotage-stack.jpg',
    331: 'pink-flowers.jpg',
    332: 'pink_rice.png',
    333: 'pinstripe-glazed-tile-intersecting-circle.jpg',
    334: 'pinstripe-tile-cubic.jpg',
    335: 'pinstripe-tile-stack.jpg',
    336: 'pinstriped_suit.png',
    337: 'pixel-heart.jpg',
    338: 'plain-black-chenille.jpg',
    339: 'plain-black-sheer.jpg',
    340: 'plain-blue-chenille.jpg',
    341: 'plain-blue-flat.jpg',
    342: 'plain-blue-velvet.jpg',
    343: 'plain-brown-dimout.jpg',
    344: 'plain-duckegg-velvet.jpg',
    345: 'plain-gold-velvet.jpg',
    346: 'plain-green-chenille.jpg',
    347: 'plain-green-chenille2.jpg',
    348: 'plain-green-sheer.jpg',
    349: 'plain-green-texture.jpg',
    350: 'plain-green-velvet.jpg',
    351: 'plain-grey-sheer.jpg',
    352: 'plain-grey-velvet.jpg',
    353: 'plain-natural-sheer.jpg',
    354: 'plain-natural-texture2.jpg',
    355: 'plain-natural-velvet.jpg',
    356: 'plain-pink-texture.jpg',
    357: 'plain-red-chenille.jpg',
    358: 'plain-red-velvet.jpg',
    359: 'plain-white-dimout.jpg',
    360: 'plain-white-sheer.jpg',
    361: 'plain-white-sheer2.jpg',
    362: 'plain-white-texture.jpg',
    363: 'plastic-grass.jpg',
    364: 'plastic.jpg',
    365: 'polished-concrete-staggered.jpg',
    366: 'polished-concrete.jpg',
    367: 'polished-concrete2.jpg',
    368: 'polka-dots.png',
    369: 'polonez_car.png',
    370: 'porphyritic-granite-herringbone.jpg',
    371: 'porphyritic-granite.jpg',
    372: 'pre-loved-bio-textile.jpg',
    373: 'prism.png',
    374: 'rain.jpg',
    375: 'rammed-earth-finish.jpg',
    376: 'random_grey_variations.png',
    377: 'ravens.gif',
    378: 'reclaimed-scaffold-board-cladding-staggered.jpg',
    379: 'reconstituted-stone.jpg',
    380: 'recycled-boucle-fabric-in-foster-707221.jpg',
    381: 'recycled-textile-insulation.jpg',
    382: 'red-sandstone-stretcher.jpg',
    383: 'regal.png',
    384: 'render.jpg',
    385: 'renzler-power-down.gif',
    386: 'renzler.gif',
    387: 'repeated-square-dark.jpg',
    388: 'restaurant.png',
    389: 'restaurant_icons.png',
    390: 'rhino.gif',
    391: 'ripples.png',
    392: 'robots.png',
    393: 'roots-green-stack.jpg',
    394: 'rough-limestone.jpg',
    395: 'round-tread-aluminium.jpg',
    396: 'round.png',
    397: 'royal-silver-marble-tile.jpg',
    398: 'ruby-terrazzo.jpg',
    399: 'rusted-iron.jpg',
    400: 'rusted-steel.jpg',
    401: 'sabbia-terrazzo.jpg',
    402: 'sage-london-plane.jpg',
    403: 'sand.jpg',
    404: 'sandy-artificial-grass.jpg',
    405: 'sativa.png',
    406: 'scarybob.gif',
    407: 'school.png',
    408: 'seigaiha.png',
    409: 'shaggy-pile-carpet.jpg',
    410: 'shape-play-wallpaper-in-artists-selection.jpg',
    411: 'shattered.png',
    412: 'short-pile-carpet.jpg',
    413: 'short-pile-carpet2.jpg',
    414: 'sirocco-terrazzo.jpg',
    415: 'sirocco-terrazzo2.jpg',
    416: 'sisal-weave.jpg',
    417: 'sisal-weave2.jpg',
    418: 'skulls.png',
    419: 'skye-terrazzo.jpg',
    420: 'skyscraper-fabric.jpg',
    421: 'smiley-orange.png',
    422: 'smiley-purple.png',
    423: 'smiley-white.png',
    424: 'smoothSand.jpg',
    425: 'snow-leopard-print.jpg',
    426: 'snow-leopard-print2.jpg',
    427: 'sofia-marble-star-and-hexagon.jpg',
    428: 'soil.jpg',
    429: 'soil2.jpg',
    430: 'solo-grey-stack.jpg',
    431: 'spongie.gif',
    432: 'sports-surfacing.jpg',
    433: 'sports.png',
    434: 'spring.png',
    435: 'spruce-forest-green.jpg',
    436: 'st-andrews-multi-herringbone.jpg',
    437: 'stained-glass-wallpaper-in-dawn.jpg',
    438: 'stained-glass-wallpaper-in-dusk.jpg',
    439: 'stained-timber.jpg',
    440: 'stardust.png',
    441: 'stones.jpg',
    442: 'straw-flowers.gif',
    443: 'striped-cotton-fabric.jpg',
    444: 'suede.jpg',
    445: 'suede2.jpg',
    446: 'sun-pattern.png',
    447: 'suyaki-ebony-stretcher.jpg',
    448: 'swaledale-fossil.jpg',
    449: 'swirl_pattern.png',
    450: 'tartan.jpg',
    451: 'terracotta-scarpa.jpg',
    452: 'terrazzo-artico-circular.jpg',
    453: 'terrazzo.jpg',
    454: 'tex2res4.png',
    455: 'textured-carpet.jpg',
    456: 'textured-plaster2.jpg',
    457: 'textured-stucco.jpg',
    458: 'tic-tac-toe.png',
    459: 'tile-grey-victorian-tile-stack.jpg',
    460: 'tints-ashton-green-herringbone.jpg',
    461: 'tiny-squares.png',
    462: 'topography.png',
    463: 'transmit.gif',
    464: 'travertine-corfiot.jpg',
    465: 'travertine-cubic.jpg',
    466: 'travertine-hopscotch.jpg',
    467: 'travertine.jpg',
    468: 'tree-bark.jpg',
    469: 'tree_bark.png',
    470: 'trees.png',
    471: 'type.png',
    472: 'upfeathers.png',
    473: 'usnic.jpg',
    474: 'venetian-plaster.jpg',
    475: 'verde-alpi-marble-varied-terrazzo.jpg',
    476: 'vero-herringbone-catania.jpg',
    477: 'vertical-bush-hammered-concrete.jpg',
    478: 'victorian-glazed-cubic.jpg',
    479: 'victorian-glazed-fishscale.jpg',
    480: 'vintage-concrete.png',
    481: 'walnut.jpg',
    482: 'watercolor.jpg',
    483: 'wavy-dots.png',
    484: 'weather.png',
    485: 'western-red-cedar-stack.jpg',
    486: 'wheat-straw.jpg',
    487: 'wheat.png',
    488: 'white-marble.jpg',
    489: 'white-marble2.jpg',
    490: 'white-oiled-timber-chevron.jpg',
    491: 'white-waves.png',
    492: 'wildGrass2.jpeg',
    493: 'wild_flowers.png',
    494: 'wild_oliva.png',
    495: 'william-morris-chrysanthemum-textile.jpg',
    496: 'william-morris-cray-textile.jpg',
    497: 'william-morris-ispahan-textile.jpg',
    498: 'william-morris-marigold-textile.jpg',
    499: 'william-morris-pigeon-textile.jpg',
    500: 'wool-composite-insulation.jpg',
    501: 'wormz.png',
    502: 'worn-wood.jpg',
    503: 'xv.png',
    504: 'zigzag-patterned-textile.jpg',
    505: 'zinc.jpg',
    // Add more mappings as needed
};