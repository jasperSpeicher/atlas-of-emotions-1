/* eslint-disable radix */
import {
    getColorWithTransparency,
    getDecenteringTweenVariables,
    getDefaultTweenVars,
    getEmotionColor,
    getEventPhrases,
    getPhrasesWithLineHeight,
} from "./scrollerDataHelpers";
  
import { sharedStyle } from "./config";
  
  const DEFAULT_HEIGHT = "100vh";
  
  // Example phrase configs
  const phrasePairs = [
    { pair: { event: "Successful interview" }, emotion: "enjoyment" },
    { pair: { event: "Forgetting phone password" }, emotion: "fear" },
    { pair: { event: "Enjoyed a vacation" }, emotion: "enjoyment" },
    { pair: { event: "Stuck in an elevator" }, emotion: "fear" },
    { pair: { event: "Slow internet speed" }, emotion: "anger" },
    { pair: { event: "Dirty dishes everywhere" }, emotion: "disgust" },
    { pair: { event: "Hear a strange noise" }, emotion: "fear" },
    { pair: { event: "Hear a good joke" }, emotion: "enjoyment" },
    { pair: { event: "Laid off" }, emotion: "sadness" },
    { pair: { event: "Spilled coffee on shirt" }, emotion: "anger" },
    { pair: { event: "Got a promotion" }, emotion: "enjoyment" },
    { pair: { event: "Moldy shower grout" }, emotion: "disgust" },
    { pair: { event: "Plane turbulence" }, emotion: "fear" },
    { pair: { event: "Construction noise nearby" }, emotion: "anger" },
    { pair: { event: "Lost phone charger" }, emotion: "fear" },
    { pair: { event: "Helped a stranger" }, emotion: "enjoyment" },
    { pair: { event: "Rotten food in fridge" }, emotion: "disgust" },
    // do not end on anger because that is the emotion in the next section
    { pair: { event: "Plane turbulence" }, emotion: "fear" },
  ];
  
  // Build a list of “pile up events” using one of your imported helpers
  const pileUpEvents = getEventPhrases({
    lineHeight: 1.5,
    changeColor: true,
    preventFlicker: true,
    phrasePairs,
  });
  
  const finalPiledUpEmotion = phrasePairs[phrasePairs.length - 1].emotion;
  const transparentPiledUpEmotion = getColorWithTransparency(finalPiledUpEmotion);
  
  /**
   * Creates an array of scroller section objects that simulate a "breathing" animation
   * by adjusting decentering tween variables.
   */
  const breathingSections = (phrase, startSize, breathSize) => [
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 0.5}vh`,
      content: " ",
      styleKey: "decentering",
      tweenComponent: "emotion",
      scrollTriggerComponent: "heading",
      tweenType: "fromTo",
      tweenVars: [
        {
          ...getDecenteringTweenVariables(startSize),
          scrollTrigger: {
            scrub: true,
            start: "top bottom",
            end: "bottom center",
          },
          ease: "power2",
          duration: 10,
        },
        {
          ...getDecenteringTweenVariables(breathSize),
          duration: 10,
          ease: "power2",
        },
      ],
    },
    {
      content: phrase,
      height: `30px`,
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 2}vh`,
      content: " ",
      styleKey: "decentering",
      tweenComponent: "emotion",
      scrollTriggerComponent: "heading",
      tweenType: "fromTo",
      tweenVars: [
        {
          ...getDecenteringTweenVariables(breathSize),
          scrollTrigger: {
            scrub: true,
            start: "top center",
            end: "bottom bottom",
          },
          ease: "power2",
        },
        {
          ...getDecenteringTweenVariables(startSize),
          duration: 1,
        },
      ],
    },
  ];
  
  /**
   * Creates an array of scroller section objects that simulate a transient emotion,
   * changing from one color to another and back again.
   */
  const transientEmotionSections = (phrase, startEmotion, transientEmotion) => [
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 0.25}vh`,
      content: " ",
      tweenComponent: "emotion",
      scrollTriggerComponent: "heading",
      tweenType: "fromTo",
      tweenVars: [
        {
          backgroundColor: startEmotion
            ? getEmotionColor(startEmotion)
            : "rgba(0,0,0,0)",
          scrollTrigger: {
            scrub: true,
            start: "top bottom",
            end: "bottom center",
            toggleActions: "restart none reverse none",
          },
        },
        {
          backgroundColor: getEmotionColor(transientEmotion),
          duration: 1,
        },
      ],
    },
    {
      content: phrase,
      height: `30px`,
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 0.5}vh`,
      content: " ",
      styleKey: "decentering",
      tweenComponent: "emotion",
      scrollTriggerComponent: "heading",
      tweenType: "fromTo",
      tweenVars: [
        {
          backgroundColor: getEmotionColor(transientEmotion),
          scrollTrigger: {
            scrub: true,
            start: "top center",
            end: "bottom top",
            toggleActions: "restart none reverse none",
          },
        },
        {
          backgroundColor: startEmotion
            ? getEmotionColor(startEmotion)
            : "rgba(0,0,0,0)",
          duration: 1,
        },
      ],
    },
  ];
  
  // Your array of scroller sections, now with no JSX:
  export const scrollerSections = [
    {
      content: "As we live our lives...",
      height: DEFAULT_HEIGHT,
      id: "waking-up__introduction",
      styleKey: "opacity",
      tweenVars: {
        opacity: 1,
        scrollTrigger: {
          start: "top center",
        },
      },
    },
    {
      content: "...we have experiences.",
      height: DEFAULT_HEIGHT,
      tweenVars: {
        scrollTrigger: {
          pin: true,
          pinSpacing: false,
          start: "65% center",
          end: "bottom+=570px center",
        },
      },
      experiences: {
        events: getPhrasesWithLineHeight(
          [
            "late to an appointment",
            "surprise gift",
            "spilled water on computer",
            "foul smell",
            "great first date",
            "feel unseen",
          ],
          3
        ),
      },
    },
    {
      content: "Some might feel less important.",
      height: DEFAULT_HEIGHT,
      styleKey: "small",
      tweenVars: [
        {
          scrollTrigger: {
            pin: true,
            pinSpacing: false,
            start: "65% center",
            end: "bottom+=700px center",
          },
        },
        {
          opacity: 0,
          filter: "blur(100px)",
          scrollTrigger: {
            start: "bottom-=250px center",
            end: "bottom+=10% center",
            pinSpacing: false,
          },
        },
      ],
      experiences: {
        styleKey: "small",
        events: getPhrasesWithLineHeight(
          [
            "Hear a good joke",
            "Houseplant wilting",
            "Lost phone charger",
            "Out of laundry detergent",
          ],
          3
        ),
      },
    },
    {
      content: "While others feel very important...",
      height: DEFAULT_HEIGHT,
      tweenVars: {
        scrollTrigger: {
          pin: true,
          pinSpacing: false,
          start: "65% center",
          end: "bottom+=1000px center",
        },
      },
      experiences: {
        events: getPhrasesWithLineHeight(
          [
            "Car accident",
            "Falling in love",
            "Bad doctor visit",
            "Laid off",
            "Overflowing toilet",
            "Losing a loved one",
          ],
          3
        ),
      },
    },
    {
      content: "and they trigger our emotions.",
      height: DEFAULT_HEIGHT,
      tweenComponent: "emotion",
      scrollTriggerComponent: "section",
      tweenType: "fromTo",
      tweenVars: [
        {
          ...getDecenteringTweenVariables(100),
          duration: 10,
          scrollTrigger: {
            scrub: true,
            start: "bottom-=50px center",
            end: "bottom+=30px center",
          },
        },
        {
          ...getDecenteringTweenVariables(0),
          duration: 10,
        },
      ],
      experiences: {
        styleKey: "large",
        events: getEventPhrases({
          phrasePairs: [
            {
              emotion: "sadness",
              pair: { event: "relationship falls apart" },
            },
          ],
          changeColor: true,
          lineHeight: 3,
        }),
      },
    },
    {
      content: "Emotions color our perception of the outer world",
      height: DEFAULT_HEIGHT,
      scrollTriggerComponent: "section",
      tweenVars: {
        scrollTrigger: {
          pin: true,
          start: "center center",
          end: "bottom center+=30px",
          pinSpacing: false,
        },
      },
    },
    {
      content: "with stories and messages from our inner world.",
      height: "30px",
      tweenComponent: "emotion",
      tweenType: "fromTo",
      tweenVars: [
        {
          backgroundColor: getEmotionColor("sadness"),
          scrollTrigger: {
            start: "center-=50px center",
            end: "bottom-=50px center",
          },
        },
        {
          backgroundColor: getEmotionColor("enjoyment"),
        },
      ],
    },
    {
      content: " ",
      height: `${parseInt(DEFAULT_HEIGHT) * 1}vh`,
      tweenType: "fromTo",
      tweenComponent: "emotion",
      tweenVars: [
        {
          backgroundColor: getEmotionColor("enjoyment"),
          scrollTrigger: {
            start: "top center",
            end: "bottom bottom",
          },
        },
        {
          backgroundColor: getColorWithTransparency("enjoyment"),
        },
      ],
    },
    ...transientEmotionSections("Emotions come and go", undefined, "fear"),
    {
      content: "Sometimes many experiences pile up and we feel a lot...",
      height: DEFAULT_HEIGHT,
      tweenVars: (() => {
        // Example of combining multiple tween vars from getDefaultTweenVars
        const [pos, opacity] = getDefaultTweenVars();
        return [
          {
            ...pos,
            scrollTrigger: {
              ...pos.scrollTrigger,
              start: "60% center",
              end: "bottom+=1000px center",
            },
          },
          {
            ...opacity,
            scrollTrigger: {
              ...opacity.scrollTrigger,
              start: "61% center",
              end: "65% center",
            },
          },
        ];
      })(),
      experiences: {
        events: pileUpEvents,
      },
    },
    {
      content: "",
      height: `${parseInt(DEFAULT_HEIGHT) / 4}vh`,
      tweenType: "fromTo",
      tweenComponent: "emotion",
      tweenVars: [
        {
          backgroundColor: getEmotionColor(finalPiledUpEmotion),
          scrollTrigger: {
            pin: true,
            start: "top center",
            end: "bottom-=20px top",
            pinSpacing: false,
            scrub: true,
          },
        },
        {
          backgroundColor: transparentPiledUpEmotion,
          pin: true,
        },
      ],
    },
    {
      content: "...or one experience feels really big.",
      height: DEFAULT_HEIGHT,
      tweenVars: getDefaultTweenVars(),
    },
    {
      content: "Arguing with a loved one",
      height: "100px",
      tweenComponent: "emotion",
      styleKey: "large",
      tweenVars: [
        {
          backgroundColor: getEmotionColor("anger"),
          scrollTrigger: {
            start: "center-=50px center",
            end: "bottom-=50px center",
          },
        },
      ],
    },
    {
      // Original JSX was something like:
      // content: (
      //   <div>
      //     <p>In these moments...</p>
      //   </div>
      // ),
      content: `
        <div>
          <p>In these moments, it is hard to separate what we feel inside</p>
          <p>from what is actually happening around us.</p>
        </div>
      `,
      height: DEFAULT_HEIGHT,
    },
    {
      content: "And we may respond without thinking.",
      height: DEFAULT_HEIGHT,
    },
    {
      content: "Without clear understanding or intention...",
      height: DEFAULT_HEIGHT,
      scrollTriggerComponent: "section",
      tweenVars: [
        {
          scrollTrigger: {
            pin: true,
            start: "center center",
            end: "bottom center+=30px",
            pinSpacing: false,
          },
        },
        {
          opacity: 0,
          filter: "blur(60px)",
          scrollTrigger: {
            start: "51% center",
            end: "100% center",
            pinSpacing: false,
          },
        },
      ],
    },
    {
      // Original JSX:
      // content: (
      //   <div id="regret-response">we might act in ways we regret later.</div>
      // ),
      content: `
        <div id="waking-up__regret-response">we might act in ways we regret later.</div>
      `,
      height: "30px",
      tweenVars: [
        {
          scrollTrigger: {
            start: "center center+=30px",
            end: "bottom center+=30px",
            pinSpacing: false,
            onEnter: () => {
              const e = document.querySelector("#waking-up__regret-response");
              if (e) {
                e.innerHTML = "Shout at them";
                e.style.fontSize = "3.5rem";
              }
            },
            onLeaveBack: () => {
              const e = document.querySelector("#waking-up__regret-response");
              if (e) {
                e.innerHTML = "we might act in ways we regret later.";
                e.removeAttribute("style");
              }
            },
          },
        },
        {
          scrollTrigger: {
            start: "center center-=100px",
            end: "bottom center-=100px",
            pinSpacing: false,
            onEnter: () => {
              const e = document.querySelector("#waking-up__regret-response");
              if (e) {
                e.innerHTML = "Mock them";
              }
            },
            onLeaveBack: () => {
              const e = document.querySelector("#waking-up__regret-response");
              if (e) {
                e.innerHTML = "Shout at them";
              }
            },
          },
        },
        {
          scrollTrigger: {
            start: "center center-=200px",
            end: "bottom center-=200px",
            pinSpacing: false,
            onEnter: () => {
              const e = document.querySelector("#waking-up__regret-response");
              if (e) {
                e.innerHTML = "Ignore them";
              }
            },
            onLeaveBack: () => {
              const e = document.querySelector("#waking-up__regret-response");
              if (e) {
                e.innerHTML = "Mock them";
              }
            },
          },
        },
        {
          scrollTrigger: {
            start: "center center-=300px",
            end: "bottom center-=300px",
            pinSpacing: false,
            onEnter: () => {
              const e = document.querySelector("#waking-up__regret-response");
              if (e) {
                e.innerHTML = "Hide our feelings";
              }
            },
            onLeaveBack: () => {
              const e = document.querySelector("#waking-up__regret-response");
              if (e) {
                e.innerHTML = "Ignore them";
              }
            },
          },
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 1.5}vh`,
      content: "So what can we do?",
      scrollTriggerComponent: "section",
      tweenVars: [
        {
          scrollTrigger: {
            pin: true,
            pinSpacing: false,
            start: "center center",
            end: "bottom center+=30px",
          },
        },
        {
          opacity: 0,
          filter: "blur(60px)",
          scrollTrigger: {
            start: "51% center",
            end: "100% center",
            pinSpacing: false,
          },
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 3}vh`,
      content: "We can pause...",
      styleKey: "decentering",
      tweenComponent: "emotion",
      scrollTriggerComponent: "heading",
      tweenType: "fromTo",
      tweenVars: [
        {
          ...getDecenteringTweenVariables(40),
          duration: 10,
          scrollTrigger: {
            pin: true,
            pinSpacing: false,
            scrub: true,
            start: "top+=30px center",
            end: "bottom bottom",
          },
        },
        {
          ...getDecenteringTweenVariables(90),
          duration: 10,
        },
      ],
    },
    ...breathingSections("Connect to our breath...", 90, 80),
    ...breathingSections("Ride the wave of emotion...", 90, 60),
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 1}vh`,
      content: "...recognize that we are in an emotional state,",
      styleKey: "decentering",
      tweenComponent: "emotion",
      scrollTriggerComponent: "heading",
      tweenType: "fromTo",
      tweenVars: [
        {
          ...getDecenteringTweenVariables(90),
          duration: 10,
          ease: "power2",
          scrollTrigger: {
            pin: true,
            pinSpacing: false,
            scrub: true,
            start: "top center-=200px",
            end: "bottom top-=400px",
          },
        },
        {
          ...getDecenteringTweenVariables(100),
          duration: 1,
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 1}vh`,
      content: "",
      scrollTriggerComponent: "heading",
      tweenVars: [
        {
          scrollTrigger: {
            pin: true,
            pinSpacing: false,
            scrub: true,
            start: "center center",
            end: "bottom top",
            onEnter: () => {
              const e = document.querySelector("#waking-up__emotion-label-anger");
              if (e) {
                e.style.opacity = "1";
              }
            },
            onLeaveBack: () => {
              const e = document.querySelector("#waking-up__emotion-label-anger");
              if (e) {
                e.style.opacity = "0";
              }
            },
          },
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 1}vh`,
      content: "",
      scrollTriggerComponent: "heading",
      tweenVars: [
        {
          scrollTrigger: {
            pin: true,
            pinSpacing: false,
            scrub: true,
            start: "center center",
            end: "bottom top",
            onEnter: () => {
              const els = document.querySelectorAll(
                ".waking-up__emotion-label--with-circle"
              );
              els.forEach((l) => (l.style.opacity = "1"));
            },
            onLeaveBack: () => {
              const els = document.querySelectorAll(
                ".waking-up__emotion-label--with-circle"
              );
              els.forEach((l) => (l.style.opacity = "0"));
            },
          },
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 1}vh`,
      content: "",
      scrollTriggerComponent: "heading",
      tweenVars: [
        {
          scrollTrigger: {
            pin: true,
            pinSpacing: false,
            scrub: true,
            start: "center center",
            end: "bottom top",
            onEnter: () => {
              const els = document.querySelectorAll(
                ".waking-up__emotion-label--with-circle"
              );
              els.forEach((l) => (l.style.opacity = "0"));
            },
            onLeaveBack: () => {
              const els = document.querySelectorAll(
                ".waking-up__emotion-label--with-circle"
              );
              els.forEach((l) => (l.style.opacity = "1"));
            },
          },
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 0.5}vh`,
      // Originally:
      // content: (
      //   <div>
      //     <span id="become-curious">and become curious...</span>
      //     ...
      //   </div>
      // ),
      content: `
        <div>
          <span id="waking-up__become-curious">and become curious and</span>
          <span> kind about our emotion.&nbsp;&nbsp;</span>
        </div>
      `,
      id: "waking-up__curious",
      scrollTriggerComponent: "heading",
      tweenVars: [
        {
          scrollTrigger: {
            scrub: true,
            start: "top center",
            end: "bottom center",
            onUpdate: (scrollTrigger) => {
              const { progress, trigger } = scrollTrigger;
              const emotionWidth = window.innerWidth / 6;
              const curiousSpan = trigger?.querySelector("#waking-up__become-curious");
              if (curiousSpan) {
                curiousSpan.style.marginRight = `${
                  Math.sin(progress * Math.PI) * emotionWidth
                }px`;
              }
            },
          },
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 0.5}vh`,
      // Originally:
      // content: (
      //   <div class="timeline-questions" id="trigger-timeline">
      //     <span className={sharedStyle.triggerQuestion}>What causes...</span>
      //     <img className={sharedStyle.triggerArrow} src="/img/right-arrow.svg" />
      //   </div>
      // ),
      content: `
        <div class="timeline-questions" id="waking-up__trigger-timeline">
          <span class="${sharedStyle.triggerQuestion}">What causes this feeling?</span>
          <img class="${sharedStyle.triggerArrow}" src="/img/right-arrow.svg" />
        </div>
      `,
      scrollTriggerComponent: "heading",
      tweenVars: [
        {
          scrollTrigger: {
            ...getDefaultTweenVars()[0].scrollTrigger,
            end: "bottom top-=10000px",
          },
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 1}vh`,
      id: "waking-up__trigger-questions-section",
      content: "",
      scrollTriggerComponent: "heading",
      tweenVars: getDefaultTweenVars(),
      experiences: {
        events: [
          { phrase: "what just happened?" },
          { phrase: "what was I expecting?" },
          { phrase: "what's the big picture?" },
          { phrase: "how is my past involved?" },
          { phrase: "how was my day?" },
          { phrase: "am I well rested?" },
        ],
      },
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 0.5}vh`,
      // Originally:
      // content: (
      //   <div class="timeline-questions" id="response-timeline">
      //     <img className={sharedStyle.responseArrow} src="/img/right-arrow.svg" />
      //     <span className={sharedStyle.responseQuestion}>How do I respond?</span>
      //   </div>
      // ),
      content: `
        <div class="timeline-questions" id="waking-up__response-timeline">
          <img class="${sharedStyle.responseArrow}" src="/img/right-arrow.svg" />
          <span class="${sharedStyle.responseQuestion}">How do I respond?</span>
        </div>
      `,
      scrollTriggerComponent: "heading",
      tweenVars: [
        {
          scrollTrigger: {
            ...getDefaultTweenVars()[0].scrollTrigger,
            end: "bottom top-=10000px",
          },
        },
      ],
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 1}vh`,
      id: "waking-up__response-questions-section",
      content: "",
      scrollTriggerComponent: "heading",
      tweenVars: getDefaultTweenVars(),
      experiences: {
        events: [
          { phrase: "what is my goal?" },
          { phrase: "what are my options right now?" },
          { phrase: "are there different ways to see this?" },
          { phrase: "how am I affecting others?" },
          { phrase: "what is a good result for us?" },
          { phrase: "what can I learn from this?" },
        ],
      },
    },
    {
      height: `${parseInt(DEFAULT_HEIGHT) * 3}vh`,
      content: "",
      scrollTriggerComponent: "heading",
      tweenVars: getDefaultTweenVars(),
    },
  ];
  