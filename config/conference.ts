import moment from 'moment'
import { orderBy } from '../components/utils/arraySort'
import SponsorData from '../config/sponsors'
import { Conference as IConference, TicketsProvider } from './types'
import venue from './venue'

const name = 'DDD Brisbane'
const tagLine = `${name} is a non profit community event run be developers, for developers`

const hideDate = false
const isSoldOut = false
const date = moment.parseZone('2019-12-07T08:00+10:00')
const endDate = date.clone().add(12, 'h')
const currentInstance = parseInt(date.format('YYYY'), 10)
const firstInstance = 2011
const registrationOpenFrom = moment.parseZone('2019-10-30T08:00:00+10:00')
const registrationOpenUntil = hideDate
  ? null
  : date
      .clone()
      .add(-1, 'd')
      .startOf('day')
      .add(17, 'h')
const presentationSubmissionsOpenFrom = moment.parseZone('2019-09-23T08:00:00+10:00')
const presentationSubmissionsOpenUntil = moment.parseZone('2019-10-12T23:59:59+10:00')
const votingOpenFrom = moment.parseZone('2019-10-14T17:00:00+10:00')
const votingOpenUntil = moment.parseZone('2019-10-23T23:59:59+10:00')
const agendaPublishedFrom = moment.parseZone('2019-10-28T17:00:00+10:00')
const feedbackOpenFrom = date.clone()
const feedbackOpenUntil = endDate
const importantDates = [
  {
    Date: presentationSubmissionsOpenFrom,
    Description: 'Call for presentations open',
    Type: 'content',
  },
  {
    Date: presentationSubmissionsOpenUntil,
    Description: 'Call for presentations close',
    Type: 'content',
  },
  {
    Date: registrationOpenFrom,
    Description: 'Ticket sales open',
    Type: 'tickets',
  },
  { Description: 'Voting open', Date: votingOpenFrom, Type: 'voting' },
  { Description: 'Voting close', Date: votingOpenUntil, Type: 'voting' },
  {
    Date: agendaPublishedFrom,
    Description: 'Agenda published',
    Type: 'agenda',
  },
]

if (registrationOpenUntil !== null && !isSoldOut) {
  importantDates.push({
    Date: registrationOpenUntil,
    Description: 'Ticket sales close',
    Type: 'tickets',
  })
}

if (!hideDate) {
  importantDates.push({
    Date: date,
    Description: 'Conference day',
    Type: 'conference',
  })
}

// tslint:disable:object-literal-sort-keys
const Conference: IConference = {
  Name: name,
  Instance: currentInstance.toString(),
  PreviousInstance: (currentInstance - 1).toString(),
  PreviousInstances: [...Array(currentInstance - firstInstance).keys()].map((_, i) => (firstInstance + i).toString()),
  Organiser: {
    Name: 'DDD Brisbane',
    Url: '',
    ShirtColour: 'red',
  },
  TagLine: tagLine,
  SiteDescription: `${tagLine}.`,
  Goal:
    'Our goal is to create an approachable event that appeals to the whole community. Anyone can submit a session to the event, and delegates vote for the sessions they want to see.',
  GoogleAnalyticsId: 'UA-60040308-1',
  TicketPrice: '$49',
  ChildcarePrice: '$30',
  TicketsProviderId: TicketsProvider.Tito,
  TicketsProviderAccountId: 'dddperth',
  TicketsProviderEventId: '2019',
  TicketsProviderFinancialAssistanceCode: 'financialassistance',
  IsSoldOut: isSoldOut,
  HashTag: 'dddbne',
  SellingPoints: ['One day', 'Fully catered', 'Inclusive atmosphere', 'Industry-leading Presenters', 'Awesome people'],
  Handbook: null,
  SessionizeUrl: 'https://sessionize.com/dddperth2019',
  SessionizeEditUrl: 'https://sessionize.com/app/speaker/',
  PreviouslySubmittedTopics:
    'Agile, building great teams, UI design, UX, software testing, virtual reality, women in tech, web accessibility, open source software, workplace culture, mental health, unconscious bias, building engaged teams, self-employment tips, mentoring, Scrum, pair programming, bots, IoT, machine learning, neural networks, quantum encryption, security, reverse engineering, blockchain, Assembly language, automated deployments, mobile development, mobile test automation, Domain Driven Design, cloud native, architecture, microservices, serverless, service meshes, stream programming and Rx, APIs, GraphQL, actors, JavaScript, SPAs, TypeScript, authentication, React, UWP, Elm, HTML, HTTP protocol, Git, Docker and pointers',

  ContactEmail: 'info@dddbrisbane.com',
  SponsorshipEmail: 'sponsorship@dddbrisbane.com',
  MentoringEmail: 'mentors@dddbrisbane.com',
  EmergencyContactName: 'Chris',
  EmergencyContactPhoneNumber: '0400 xxx',
  MediaOfficerName: 'Someone',

  AnonymousReportFormUrl:
    'https://forms.office.com/Pages/ResponsePage.aspx?id=8IU585acE0S9pvuDhIEiS26sQVnJFzFLm-6XlxI4bCFURDVGTks2N1VOQVBWWUU1VFJESDZMNlkxNS4u',

  AnonymousVoting: false,
  MinVotes: 8,
  MaxVotes: 12,

  Date: date,
  EndDate: endDate,
  DoorsOpenTime: '8:10am',
  FinishTime: '5:10pm',
  RegistrationOpenFrom: registrationOpenFrom,
  RegistrationOpenUntil: registrationOpenUntil,
  PresentationSubmissionsOpenFrom: presentationSubmissionsOpenFrom,
  PresentationSubmissionsOpenUntil: presentationSubmissionsOpenUntil,
  VotingOpenFrom: votingOpenFrom,
  VotingOpenUntil: votingOpenUntil,
  AgendaPublishedFrom: agendaPublishedFrom,
  FeedbackOpenFrom: feedbackOpenFrom,
  FeedbackOpenUntil: feedbackOpenUntil,

  ConferenceFeedbackLink: null,
  SessionFeedbackLink: null,

  HideDate: hideDate,
  HideSponsors: true,
  HideSponsorshipUpsell: false,
  HideVenue: venue === null,
  HideAfterpartyVenue: venue === null || venue.Afterparty === null,

  Venue: venue,

  Socials: {
    Twitter: {
      Id: '977876011',
      Name: 'DDDBrisbane',
    },
    Facebook: 'DDDBri',
    Flickr: 'https://www.flickr.com/photos/135003652@N08/albums',
    Youtube: 'https://www.youtube.com/channel/UCj4UnNYakbLAh2xTWTjeoAQ',
    Blog: 'https://blog.dddperth.com/',
    Email: 'info@dddbrisbane.com',
    MailingList: 'http://eepurl.com/cRvaSf',
    GitHub: 'dddwa',
  },

  ImageStrip: [
    { Url: '/static/images/strip/1.jpg', Alternate: 'Kris Howard delivering her 2017 locknote' },
    { Url: '/static/images/strip/2.jpg', Alternate: 'Our 2017 speakers' },
    { Url: '/static/images/strip/3.jpg', Alternate: 'Visting the readify booth' },
    { Url: '/static/images/strip/4.jpg', Alternate: 'Early morning registration' },
    { Url: '/static/images/strip/5.jpg', Alternate: 'Donna Edwards speaking at DDD 2017' },
  ],

  ImportantContacts: {
    Police: {
      Details: '2 Fitzgerald St, Northbridge WA 6003 ph: (08) 9422 7111',
      MapUrl:
        'https://www.google.com.au/maps/place/WA+Police/@-31.9539457,115.8571227,15z/data=!4m8!1m2!2m1!1swa+police!3m4!1s0x2a32bad2aad309a9:0x132b875b4c12ce8a!8m2!3d-31.9465398!4d115.852523',
    },
    CentreAgainstSexualAssault: {
      Details: '1800 806 292',
    },
    EmergencyMedical: {
      Details: 'Royal Perth Hospital, 197 Wellington St, Perth WA 6000',
      MapUrl:
        'https://www.google.com.au/maps/place/Royal+Perth+Hospital/@-31.953946,115.8637156,17z/data=!3m1!4b1!4m5!3m4!1s0x2a32bb26d7818b2d:0x31db7aa443eb9c11!8m2!3d-31.953946!4d115.8659043',
    },
    NonEmergencyMedical: {
      Details: 'Perth Medical Centre, 713 Hay St, Perth WA 6000 ph: (08) 9481 4342',
      MapUrl:
        'https://www.google.com.au/maps/place/Perth+Medical+Centre/@-31.9539771,115.8552714,17z/data=!3m1!4b1!4m5!3m4!1s0x2a32bad5d00fb27f:0xa93cc014867a5f8b!8m2!3d-31.9539771!4d115.8574654',
    },
  },

  ImportantDates: orderBy(importantDates, i => i.Date),

  Sponsors: SponsorData,

  Keynotes: [],
}

export default Conference
