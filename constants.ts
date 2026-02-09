
import { Project, Artwork } from './types';
import React from 'react';

// --- Static Asset Generation Helpers ---

// Helper to format multi-line strings: removes editor line breaks, keeps only \n
const txt = (str: string) => str.replace(/\n{3,}/g, '\n\n').replace(/\n(?!\n)/g, ' ').trim();

// Helper to parse markdown-like syntax: **bold** and [text](url)
const parseText = (text: string) => {
  const parts: Array<{type: 'text' | 'bold' | 'link', content: string, url?: string}> = [];
  let current = '';
  let i = 0;
  
  while (i < text.length) {
    // Check for **bold**
    if (text.substr(i, 2) === '**') {
      if (current) parts.push({type: 'text', content: current});
      current = '';
      i += 2;
      let boldText = '';
      while (i < text.length && text.substr(i, 2) !== '**') {
        boldText += text[i];
        i++;
      }
      parts.push({type: 'bold', content: boldText});
      i += 2;
    }
    // Check for [text](url)
    else if (text[i] === '[') {
      if (current) parts.push({type: 'text', content: current});
      current = '';
      i++;
      let linkText = '';
      while (i < text.length && text[i] !== ']') {
        linkText += text[i];
        i++;
      }
      i++; // skip ]
      if (text[i] === '(') {
        i++;
        let url = '';
        while (i < text.length && text[i] !== ')') {
          url += text[i];
          i++;
        }
        parts.push({type: 'link', content: linkText, url});
        i++;
      }
    }
    else {
      current += text[i];
      i++;
    }
  }
  if (current) parts.push({type: 'text', content: current});
  return parts;
};

export { parseText };

// Helper to convert SVG string to Data URI
const svgToDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim().replace(/\s+/g, ' '))}`;

// Generates a branded placeholder image
const generatePlaceholder = (width: number, height: number, color: string, text: string, pattern: 'circle' | 'rect' | 'path' = 'circle') => {
  // Create a subtle background pattern
  const shape = pattern === 'rect' 
    ? `<rect x="${width * 0.1}" y="${height * 0.1}" width="${width * 0.8}" height="${height * 0.8}" stroke="white" stroke-width="2" fill="none" opacity="0.1"/>`
    : pattern === 'path'
    ? `<path d="M0 ${height * 0.5} Q ${width * 0.5} ${height * 0.2} ${width} ${height * 0.5}" stroke="white" stroke-width="3" fill="none" opacity="0.1"/>`
    : `<circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.3}" stroke="white" stroke-width="2" fill="none" opacity="0.1"/>`;

  // Create a noise texture overlay for "paper" feel
  const noiseFilter = `
    <filter id="noise-${text.replace(/\s/g, '')}">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"/>
    </filter>
  `;

  return svgToDataUri(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      ${shape}
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-weight="bold" font-size="${Math.min(width, height)/12}" fill="white" opacity="0.9">${text}</text>
    </svg>
  `);
};

export const SITE_CONTENT = {
  hero: {
    greeting: "Hi, I'm Jialu.",
    intro: "I build playful technologies that live between digital and physical spaces. My work invites people to move, explore, and learn by doing, turning public spaces into small stages for curiosity, emotion, and connection.",
    subtext: "Each project is a small magnet on a shared map — a memory of where movement met imagination, where code learned to listen, and where digital dreams found their home in the physical world.",
    tagline: "Playful technology for human connection"
  },
  about: {
    title: "The Creative Technologist",
    narrative: `I’m a creative technologist building interactive experiences that 
                spark curiosity, emotion, and connection.
                My background in Computer Science taught me how systems work;
                my path through games and museums taught me how people move and wonder.
                I’m drawn to the space between the digital and the physical,
                where technology helps to build a shared experience you can feel.`,
    signature: `I craft for people: turning complex constraints into playful interactions 
                and building meaningful experiences that welcome everybody into the story.`
  }
};

export const withBase = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const PROJECTS: Project[] = [
  {
    id: 'elk',
    title: 'Life of the Herd',
    location: 'Missoula, MT',
    venue: 'Rocky Mountain Elk Foundation Visitor Center',
    venueUrl: 'https://www.rmef.org/contact/visitor-center/',
    installDate: 'Oct 2025',
    coordinates: { top: '18%', left: '30%' }, // Montana - Northwest
    shortDescription: 'A four-wall immersive gesture-based experience where visitors “think like an elk” through full-body interaction, built on a custom AI tracking pipeline.',
    image: withBase('/images/projects/elk.jpg'), // UPDATE: Replace with your image path
    color: '#8D6E63',
    tags: ['Unreal Engine', 'TouchDesigner', 'Motion Tracking'],
    fullDescription: {
      vision: txt(`Visitors enter a sweeping, four-season projection mural stretching across the gallery.
        As they move closer, animations reveal elk behaviors and ecological storytelling.

        \n
        Stepping onto a projected “start spot” opens a portal into each season,
        where visitors take control of an elk using full-body gestures: 
        foraging across spring meadows, following scent trails to find the herd in summer,
        raking trees and fighting in fall, digging snow for food and running to escape predators in winter.

        \n
        The experience blends education, storytelling, and motion-driven gameplay,
        transforming wildlife learning into an embodied, playful encounter.`),
      approach: txt(`Designing a reliable gesture system for a museum environment meant tackling unpredictable lighting, changing backgrounds, unusual camera angles, and varied visitor behavior. To support four different seasonal interactions, I developed a flexible, modular tracking pipeline that could adapt quickly during both development and installation.

        \n
        This approach allowed the team to explore creative ideas, test gestures early, iterate toward more intuitive interactions, and maintain high tracking quality across all four projection walls.

        \n
        **Tracking Pipeline**

        A resilient tracking system was built using:

        [MediaPipe TouchDesigner Plugin](https://github.com/torinmb/mediapipe-touchdesigner)
        extracts pose landmarks from 2D webcam feeds, using TD to do real-time visualization, data processing, camera calibration and per-wall adjustments

        [TouchEngine for Unreal](https://github.com/TouchDesigner/TouchEngine-UE)
        streams processed data directly into Unreal Engine for mapping to gameplay

        \n
        This separation made the system easy to debug, tune, and scale across four unique camera setups.

        \n
        **Installation**

        I attended both installation trips, tuning camera positions, recalibrating tracking under construction lighting, adjusting gameplay for real visitor flow, and resolving hardware/software integration issues.

        \n
        Each wall had different lighting, shadows, and backgrounds.
        Using real-time visualization in TouchDesigner,
        the tracking could be quickly adjusted for each space, ensuring smooth performance across all four seasons.`),
      experience: '',
      connection: txt(``)
    },
    prototypes: {
      captions: [
        'Stick-figure in TD',
        'Unity + MediaPipe Hand Landmarks',
        'Unity + MediaPipe Pose Landmarks',
        'How fast can hands move?',
        'Dig Snow to Reveal Grass!',
        'Run, elk, run!',
        'Head tracking to Move elk head?',
        'Left, Right, Left, Right...',
        'Let’s rake the tree!'
      ],
      annotations: [
        'What if visitors see their skeleton? (Easy for debugging… not so cute for immersion.)',
        'Camera overhead?\nHand-tracking to trigger UI hotspots, single person only',
        'More people, less detail? Full-body triggering hotspots by hands, feet, shoulders… chaotic but interesting!',
        'Early hand velocity test to see if we can ‘dig’ and ‘run’ with motion.',
        'If I’m hungry… can digging feel THIS fun?',
        'Finally, hand and feet velocity are combined, drives the elk’s running, escape from the coyote.',
        'Early test using Blend Pose in UE Animation Blueprint:\nHuman head position mapped with elk head 4 direction animations.',
        'Kid head, Elk head\nPerfect Match!',
        'Tree shake driven by real-time wind parameter. Rake away!'
      ]
    },
    myRole: {
      title: 'Lead Developer & Creative Technologist (solo developer)',
      responsibilities: [
        'Led all technical R&D, tracking systems, and gameplay implementation',
        'Co-shaped interaction design through extensive prototyping and playtesting',
        'Delivered robust production software + on-site calibration + installation support',
        'Bridged team collaboration across design, content, animation, and fabrication'
      ]
    },
    featured: true,
    featuredOrder: 1
  },
  {
    id: 'suitup',
    title: 'SuitUp',
    location: 'Pittsburgh, PA',
    venue: 'Kamin Science Center',
    venueUrl: 'https://kaminsciencecenter.org/exhibits/sports360/',
    installDate: 'Dec 2025',
    coordinates: { top: '33%', left: '73%' }, // Pittsburgh, PA - Northeast
    shortDescription: 'A webcam-powered interactive exhibit where guests “try on” five sports uniforms through motion tracking, then explore how material science enables performance and protection.',
    image: withBase('/images/projects/suitup.JPG'), // UPDATE: Replace with your image path
    color: '#EF5350',
    tags: ['Unity', 'Motion Tracking'],
    fullDescription: {
      vision:  txt(`Suit Up is a two-station, large-format (75” portrait) interactive at Kamin Science Center
        that lets visitors see themselves as athletes—hockey goalie, Paralympic runner, football player, bicycle racer, and softball catcher.

        \n
        As guests move, a stylized avatar mirrors their body motion; selecting a sport overlays the corresponding uniform and reveals short callouts highlighting key performance and safety features.

        \n
        The experience balances quick, playful costume switching with optional deeper reading via hotspots and locker-based exhibit content.
        `),
      approach: 'Unity + MediaPipe; replaced Kinect; designed body-tracking and hotspot system.',
      experience: '',
      connection: ''
    },
    myRole: {
      title: 'Solo Developer',
      responsibilities: [
        'Prototyped and evaluated multiple tracking approaches including **RealSense Kinect**, **Snapchat Lens Studio**, **OpenCV** before selecting the final solution for reliability and exhibition constraints.',
        'Built a webcam-based tracking pipeline using **MediaPipe** AI pose tracking solution, improving museum maintainability and lowering hardware complexity.',
        'Constructed the interactive system: motion tracking, avatar puppeteering, sport selection UI, and hotspot content triggers.',
        'Implemented stylized rendering **Toon Shader** to match the exhibition’s graffiti visual language.'
      ]
    },
    stickers: [withBase('/images/awards/suitup-award.png')],
    award: {
      title: "2026 10Best Readers' Choice Award",
      category: 'Best Science Museum — ranked #3 of 10',
      url: 'https://www.anthemawards.com/winners/list/entry/#!education-art-culture/special-projects/path-of-liberty-that-which-unites-us/0/path-of-liberty/619933',
      logo: withBase('/images/awards/suitup-award.png')
    },
    featured: true,
    featuredOrder: 2
  },
  {
    id: 'glassblowing',
    title: 'Virtual Glassblowing',
    location: 'Pittsburgh, MA',
    venue: 'Pittsburgh Glass Center',
    venueUrl: 'https://www.pittsburghglasscenter.org/articles/virtual-glassblowing-is-real-at-pittsburgh-glass-center/',
    installDate: 'May 2023',
    coordinates: { top: '36%', left: '73%' }, // Pittsburgh, PA - Northeast
    shortDescription: 'An award-winning VR glassblowing experience which helps teens learn hot-shop workflow in a safe, guided virtual studio.',
    image: withBase('/images/projects/glassblowing.jpg'), // UPDATE: Replace with your image path
    color: '#FFCA28',
    tags: ['Unity', 'Mixed Reality', 'Motion Tracking'],
    fullDescription: {
      vision: txt(`Created in partnership with Pittsburgh Glass Center, this hand-tracking based VR experience puts learners in a 3D virtual hot shop
         where they practice core glassblowing steps—guided by Blaze, PGC’s mascot, 
         then see results in a virtual gallery to connect technique, craft, and artistic outcome.

        \n
        This first-of-its-kind VR educational and creative experience is used to: 
        
        \n
          -  Expand access to glass education beyond the walls of the PGC facility
        \n
          -  Educate young students about glassblowing
        \n
          -  Generate appreciation and excitement for glass
        \n
          -  Prepare students before they step up to the 2,000-degree furnace`),
      approach: txt(`To replicate glassblowing in VR in a way that is realistic, playful, and safe, 
        the core approach was to treat interaction design as both a craft simulation problem and a K–12 usability problem. 
        We leveraged **Meta Quest Pro hand tracking** to make the experience feel physically intuitive, 
        while still guiding users toward “safe” behaviors that mirror real hot-shop constraints.

       \n
       On the technical side, the interaction system focused on reliable pipe handling: 
       detecting **Grab** & **Pinch**, and keeping virtual hands visually “locked” to correct positions on the blowing pipe.
       We iterated through multiple **gesture detection** strategies and **grab zone** designs, balancing two competing goals - 
       reduce frustration when tracking is imperfect and maintain believable hand placement and safety logic.

       \n
       Through repeated playtests with **K–12 students**, we refined toward a more forgiving, natural-feeling gesture model 
       that still enforces heat-aware grab zones. The result is a controller-free interaction that feels VR-native, 
       supports varied user behaviors, and stays grounded in the real-world logic of glassblowing.`),
      experience: '',
      connection: ''
    },
    prototypes: {
      captions: [
        'Blow… but in VR?',
        'How to move the tube naturally?',
        'Can a cube teach glassblowing?',
        'What does glassblowing actually feel like?',
        'Water break!',
        'Can learning feel like making art?'
      ],
      annotations: [
        'Pinch the straw → move to mouth → distance threshold = blow!',
        'Physics-driven bone rig generates real-time motion between straw and blowpipe.',
        'Blaze started as a simple cube to block out guidance, timing, and movement.',
        'Hands-on hot shop experience to ground the VR simulation in real technique and safety rules.',
        'Simulated pipe cooling at the water fountain to reinforce safety timing.',
        'End the workflow by exhibiting the player’s work next to featured artists, reinforces pride and completion.'
      ]
    },
    myRole: {
      title: 'Lead Developer',
      responsibilities: [
        'Led R&D and implementation of **Meta Quest Pro hand tracking**. Built reliable interactions for holding and manipulating the blowpipe.',
        'Developed **blow** mechanic by detecting hand-to-headset distance to micmic straw-to-mouth distance',
        'Built a bone based tool to dynamically generate soft tube connected straw and blowpipe for believable real-time motion.',
        'Designed and implemented step-by-step learning experience guided by an animated Cartoon Character and iterated the experience through K–12 playtests'
      ]
    },
    award: {
      title: '2023 International Serious Play Gold Award',
      category: 'Student Entry category',
      url: 'https://www7.etc.cmu.edu/blog/etc-student-project-team-wins-gold-at-serious-play-conference/',
      logo: withBase('/images/awards/glassblowing-award.png')
    },
    stickers: [withBase('/images/awards/glassblowing-award.png')],
    featured: true,
    featuredOrder: 4
  },
  {
    id: 'freedomplaza',
    title: 'Path of Liberty',
    location: 'New York, NY',
    venue: 'Freedom Plaza',
    venueUrl: 'https://pathoflibertynyc.com/',
    installDate: 'May 2025',
    coordinates: { top: '30%', left: '80%' }, // New York - Northeast
    shortDescription: 'An award-winning, six-acre outdoor installation on Manhattan’s East Side that invites visitors to contribute their voices to a living digital tapestry celebrating the upcoming 250th anniversary of American independence.',
    image: withBase('/images/projects/freedomplaza.jpg'), // UPDATE: Replace with your image path
    color: '#FFCA28',
    tags: ['FFmpeg', 'Unity', 'Shaders', 'Networking'],
    fullDescription: {
      vision: txt(`Designed by C&G Partners and featuring work by filmmaker Daniella Vale, 
          the exhibition presents hundreds of personal testimonials on 16-foot projection structures
          and invites visitors to add their own reflections through interactive media stations.

        \n
          RLMG developed the full digital media system, including the video-recording touch-screen kiosks inside the tent, backend CMS workflow,
          and the gesture-responsive outdoor projection where approved visitor submissions appear as part of an animated flag tapestry.
          These components combine to create an evolving, visitor-generated record of what liberty means in America today.`),
      approach: '',
      experience: '',
      connection: ''
    },
    stickers: [withBase('/images/awards/freedomplaza-award.png')],
    award: {
      title: 'Anthem Awards Bronze',
      category: 'Education, Art & Culture Special Projects Awareness Categories',
      url: 'https://www.anthemawards.com/winners/list/entry/#!education-art-culture/special-projects/path-of-liberty-that-which-unites-us/0/path-of-liberty/619933',
      logo: withBase('/images/awards/freedomplaza-award.png')
    },
    myRole: {
      title: 'Kiosk Software Developer',
      responsibilities: [
        'Built the kiosk recording system in **Unity**, integrating **FFmpeg** for real-time video/audio capture, trimming, encoding, and frame extraction.',
        'Developed a robust flow to handle preview, retakes, resolution, temporary file cleanup, visitors walk away and restart at anytime.',
        'Implemented **CMS** integration using **Directus**, handling upload of video + thumbnail assets, user metadata, and branching logic for optional visitor email notifications',
        'Prototyped early flag-motion concepts in **Three.js**, exploring dynamic tile animations and interactive camera controls',
        'Supported onsite installation, troubleshooting networked camera/microphone signals over Q-SYS and adjusting kiosk lighting for clean greenscreen segmentation.'
      ]
    },
    featured: true,
    featuredOrder: 3
  },
  {
    id: 'boise',
    title: 'Sustainable Boise',
    location: 'Boise, ID',
    venue: 'The WaterShed Education Center',
    venueUrl: 'https://www.boisewatershed.org/visit/exhibits/',
    installDate: 'Feb 2025',
    coordinates: { top: '28%', left: '25%' }, // Boise, ID - Northwest
    shortDescription: 'A three-wall, city-scale interactive installation where visitors explore energy, transportation, and water resilience by reshaping Boise’s infrastructure through playful, hands-on gameplay.',
    image: withBase('/images/projects/boise.jpg'), // UPDATE: Replace with your image path
    color: '#66BB6A',
    tags: ['Unity', 'Phidgets', 'Networking'],
    fullDescription: {
      vision: txt(`The Energy panel lets visitors explore how a city’s power system changes when fossil fuels are replaced with renewable energy.

      \n
        One activity focuses on infrastructure, where visitors replaced fossil-fuel plants with renewable energy sources like wind turbines, solar panels, battery storage, and hydropower plants.
      The other zooms into the neighborhood scale, using a whack-a-mole gameplay to replace gas-powered homes, vehicles, and appliances with cleaner electric alternatives.

      \n
      Together, these interactions turn complex energy concepts into intuitive, hands-on play, helping visitors understand how both system-level and everyday choices contribute to a more sustainable city.`),
      approach: txt(`Development began with a hardware workshop alongside the technologist to understand Phidgets digital I/O mapping with gameplay logic in Unity.

        \n
        To ensure visual consistency across the three-panel installation, the development team shared core tools, assets, and systems across all panels.
        Unity **2D Tile System** allowed environmental elements to update organically while maintaining a unified visual style.

        \n
        UI animations were standardized using **DOTween**, and a dynamic UI tool built with TextMeshPro supported both English and Spanish by adapting to changing text lengths and sprite-in-text layouts.
        Cross-panel behaviors such as moving clouds and moving cars using networked messaging, reinforcing the experience of a single, connected city.`),
      experience: '',
      connection: ''
    },
    prototypes: {
      captions: [
        'Wiring Phidgets',
        'Drive with a Steering Wheel?',
        'Is Icon Placement Clear?',
        'Tile System!',
        'Yes! Taiko!',
        'Playtesting!'
      ],
      annotations: [
        'Together with the technologist, we wired a box with joystick and buttons for prototype needs.',
        'For transportation panel: Testing a steering wheel control vehicle movement on screen!',
        'We tested only use Icon to represent energy sources, is it clear to users?',
        'Roads, Grass, Turning Corners... Unity Tile System makes it easy to build and edit the city map!',
        'Inspired by Taiko Drum game, we created a rythm game to enphasize the relationship between weather and energy sources.',
        'Playtesting with kids helped us identify confusing parts and improve gameplay and UI.'
      ]
    },
    myRole: {
      title: 'Unity Software Developer',
      responsibilities: [
        'Designed and implemented two hardware-driven educational minigames in **Unity**, using **Phidgets** like buttons and trackball to let visitors replace fossil-fuel infrastructure with renewable energy.',
        'Implemented a custom auto-resizable UI tool using **TextMeshProUGUI**, supporting dynamic text length changes for English and Spanish.',
        'Implemented **UDP** networking to synchronize cloud movement and lighting signals',
        'Developed and shared custom water shaders, **Dotween** based UI animations to insure the visual consistency of three panels'
      ]
    },
    featured: true,
    featuredOrder: 3
  }
];

export const ARTWORKS: Artwork[] = [
  {
    id: 'art1',
    title: 'Neon Dreams',
    description: 'Digital painting exploring light and cityscapes.',
    image: generatePlaceholder(600, 800, '#2c3e50', 'Neon Dreams', 'rect'),
    width: 600,
    height: 800
  },
  {
    id: 'art2',
    title: 'Fluidity',
    description: 'Abstract study of water dynamics.',
    image: generatePlaceholder(800, 600, '#3498db', 'Fluidity', 'path'),
    width: 800,
    height: 600
  },
  {
    id: 'art3',
    title: 'Character Concept',
    description: 'Whimsical creature design for a storybook.',
    image: generatePlaceholder(600, 600, '#e67e22', 'Character Concept', 'circle'),
    width: 600,
    height: 600
  },
  {
    id: 'art4',
    title: 'Geometric Harmony',
    description: 'Vector illustration focusing on balance.',
    image: generatePlaceholder(700, 900, '#9b59b6', 'Geometric Harmony', 'rect'),
    width: 700,
    height: 900
  },
  {
    id: 'art5',
    title: 'Silence',
    description: 'Minimalist composition.',
    image: generatePlaceholder(800, 500, '#95a5a6', 'Silence', 'path'),
    width: 800,
    height: 500
  },
  {
    id: 'art6',
    title: 'Growth',
    description: 'Botanical illustration series.',
    image: generatePlaceholder(600, 800, '#27ae60', 'Growth', 'circle'),
    width: 600,
    height: 800
  },
  {
    id: 'art7',
    title: 'Cyber Folk',
    description: 'Mixing traditional patterns with sci-fi elements.',
    image: generatePlaceholder(900, 600, '#c0392b', 'Cyber Folk', 'rect'),
    width: 900,
    height: 600
  }
];
