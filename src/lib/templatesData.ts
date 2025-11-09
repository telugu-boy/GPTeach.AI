import type { Template, TimedActivity } from './types'

const paragraphs = (lines: string[]): string => lines.map((line) => `<p>${line}</p>`).join('')

const anticipatoryBlock = (title: string, minutes: number, details: string): TimedActivity => ({
  id: title.toLowerCase().replace(/\s+/g, '-'),
  minutes,
  title,
  details
})

export const lessonPlanTemplates: Template[] = [
  {
    id: 'edse-417',
    name: 'EDSE 417 Lesson Plan',
    summary:
      'University of Alberta inspired template with detailed prompts for lesson logistics, safety, and reflection checkpoints.',
    fields: [
      'date',
      'grade',
      'school',
      'teacherName',
      'courseLevel',
      'lessonTime',
      'location',
      'priorKnowledge',
      'outcomes',
      'resources',
      'objectives',
      'safety',
      'essentialQuestions',
      'essentialVocabulary',
      'crossCurricular',
      'differentiation',
      'timedActivities',
      'understandingChecks',
      'anticipatorySet',
      'bodySequence',
      'closing',
      'studentFeedback',
      'lookingAhead',
      'assessment',
      'references',
      'rubric'
    ],
    scaffold: {
      objectives: paragraphs([
        '<strong>Goal of lesson/demo:</strong> Summarize what students will know, understand, and do after the experience.',
        '<strong>Essential question(s):</strong> List guiding questions that frame inquiry for the period.',
        '<strong>Essential vocabulary:</strong> Identify precise terms that must be introduced or reinforced.'
      ]),
      priorKnowledge: paragraphs([
        '<strong>Prerequisites / Previous knowledge:</strong> Capture specific skills, labs, or readings students should bring into today.',
        '<strong>Cross-curricular connections:</strong> Note explicit ties to other subject areas or competencies.'
      ]),
      materials: [
        'Teacher-facing resources (slides, demonstrations, manipulatives)',
        'Student-facing resources (handouts, graphic organizers, digital tools)',
        'Technical requirements (devices, software, lab equipment)',
        'Safety equipment checklist as required'
      ],
      assessment: paragraphs([
        '<strong>Check for understanding:</strong> Outline both formative and summative assessment moments for each activity block.',
        '<strong>Evidence captured:</strong> Anecdotal notes, exit tickets, peer assessment, etc.'
      ]),
      differentiation: paragraphs([
        '<strong>Differentiated instructions:</strong> Identify one individual and one group needing adaptation; describe precise supports or extensions.',
        '<strong>Universal supports:</strong> Accessibility, language scaffolds, or flexible grouping plans.'
      ]),
      activities: [
        anticipatoryBlock(
          'Anticipatory Set / Hook',
          10,
          'Engage learners with a scenario, provocation, or diagnostic question that surfaces prior knowledge.'
        ),
        anticipatoryBlock(
          'Body / Learning Activities',
          35,
          'Sequence explicit instruction, guided practice, and collaborative tasks. Reference exact timing within the block.'
        ),
        anticipatoryBlock(
          'Closing & Reflection',
          15,
          'Facilitate consolidation, student feedback opportunities, and prompts for looking ahead.'
        )
      ],
      extensions: paragraphs([
        '<strong>Closing prompts:</strong> (1) Real-world/community connections, (2) Student feedback opportunities, (3) Looking ahead or next lesson teaser.'
      ]),
      references: paragraphs([
        'List research references, curricular resources, or media cited in the lesson.'
      ])
    }
  },
  {
    id: 'gradual-release',
    name: 'Gradual Release Workshop',
    summary:
      'Three-phase structure (I do, We do, You do) optimized for 60-minute blocks with embedded assessment checkpoints.',
    fields: [
      'title',
      'grade',
      'subject',
      'duration',
      'outcomes',
      'objectives',
      'materials',
      'priorKnowledge',
      'activities',
      'assessment',
      'differentiation',
      'timedActivities',
      'understandingChecks',
      'closing',
      'extensions'
    ],
    scaffold: {
      objectives: paragraphs([
        '<strong>Learning intentions:</strong> Write student-friendly statements beginning with "I can...".',
        '<strong>Success criteria:</strong> What evidence shows the intention has been met? Link directly to outcomes.'
      ]),
      priorKnowledge: paragraphs([
        'List mini-topics or prerequisite skills students must activate during the warm-up. Include quick diagnostic prompt.'
      ]),
      materials: [
        'Mini-lesson slide deck or modeling artifact',
        'Guided practice handout / manipulatives',
        'Independent practice task or station cards'
      ],
      activities: [
        anticipatoryBlock(
          'I Do - Explicit Modeling',
          15,
          'Model the strategy or concept. Narrate thinking, highlight academic language, and seed questions for guided practice.'
        ),
        anticipatoryBlock(
          'We Do - Guided Workshop',
          20,
          'Students attempt the task with frequent teacher check-ins. Capture common errors for the share-out.'
        ),
        anticipatoryBlock(
          'You Do - Independent Application',
          20,
          'Learners transfer the skill individually or in pairs. Include optional enrichment or support pathways.'
        ),
        anticipatoryBlock(
          'Closure & Exit Check',
          5,
          'Synthesize key moves, celebrate learning, and administer a quick exit ticket.'
        )
      ],
      assessment: paragraphs([
        'Specify the observation focus for each phase (e.g., questioning during "We Do", exit ticket rubric during "You Do").'
      ]),
      differentiation: paragraphs([
        'List supports for striving learners (sentence frames, exemplars, conferencing schedule).',
        'List extensions for early finishers (challenge problems, peer coaching).'
      ]),
      extensions: paragraphs([
        'Describe how students revisit or extend the concept in homework, station work, or the following class.'
      ])
    }
  },
  {
    id: 'inquiry-studio',
    name: 'Inquiry Studio Cycle',
    summary:
      'Studio-style rotation where students iterate through Explore, Build, and Share stations with embedded reflection.',
    fields: [
      'title',
      'grade',
      'subject',
      'duration',
      'outcomes',
      'materials',
      'crossCurricular',
      'activities',
      'assessment',
      'differentiation',
      'extensions',
      'references',
      'rubric'
    ],
    scaffold: {
      materials: [
        'Explore station: provocations, lab materials, multimedia resources',
        'Build station: maker tools, design templates, drafting supplies',
        'Share station: gallery space, presentation tech, reflection journals'
      ],
      objectives: paragraphs([
        '<strong>Inquiry focus:</strong> Draft a driving question and success indicators for each station.',
        '<strong>Community / cross-curricular links:</strong> Identify authentic partners or disciplines represented.'
      ]),
      activities: [
        anticipatoryBlock(
          'Station 1 - Explore',
          15,
          'Students gather observations, research, or sparks that connect to the driving question.'
        ),
        anticipatoryBlock(
          'Station 2 - Build',
          20,
          'Learners prototype, write, compose, or rehearse; capture iterations in journals.'
        ),
        anticipatoryBlock(
          'Station 3 - Share',
          15,
          'Students present drafts, solicit feedback, and document next steps.'
        ),
        anticipatoryBlock(
          'Debrief Circle',
          10,
          'Whole-group reflection with sentence stems capturing insights and needs.'
        )
      ],
      assessment: paragraphs([
        'Outline formative documentation at each station (photo evidence, audio notes, peer critiques).',
        'Provide rubric anchors for final share-outs.'
      ]),
      differentiation: paragraphs([
        'Rotation-specific supports (e.g., visual prompts at Explore, mentor texts at Build).',
        'Choice points where students decide product, process, or audience.'
      ]),
      extensions: paragraphs([
        'Optional community connection, field study, or digital showcase to extend inquiry.'
      ]),
      references: paragraphs([
        'List mentor texts, real-world exemplars, or expert contacts leveraged for this studio.'
      ])
    }
  }
]
