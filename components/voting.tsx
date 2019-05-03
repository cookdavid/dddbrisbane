import moment from 'moment'
import React from 'react'
import { Panel, PanelGroup } from 'react-bootstrap'
import ReactResponsiveSelect from 'react-responsive-select/dist/ReactResponsiveSelect'
import { getSessionId, logException } from '../components/global/analytics'
import NonJumpingAffix from '../components/NonJumpingAffix'
import SessionDetails from '../components/sessionDetails'
import '../components/utils/arrayExtensions'
import { Session } from '../config/types'
import { logEvent } from './global/analytics'

interface VotingState {
  expandAll: boolean
  tagFilters: string[]
  tags: string[]
  levelFilters: string[]
  levels: string[]
  formatFilters: string[]
  formats: string[]
  flagged: string[]
  shortlist: string[]
  votes: string[]
  show: string
  ticketNumber: string
  submitInProgress: boolean
  submitError: boolean
  submitted: boolean
}

interface VotingProps {
  anonymousVoting: boolean
  sessions: Session[]
  submitVoteUrl: string
  maxVotes: number
  minVotes: number
  startTime: string
  voteId: string
}

export default class Voting extends React.PureComponent<VotingProps, VotingState> {
  componentWillMount() {
    this.setState({
      flagged: [],
      formatFilters: [],
      formats: (this.props.sessions as Session[])
        .map(s => s.Format)
        .unique()
        .sort(),
      levelFilters: [],
      levels: (this.props.sessions as Session[])
        .map(s => s.Level)
        .unique()
        .sort(),
      shortlist: [],
      show: 'all',
      submitError: false,
      submitInProgress: false,
      submitted: false,
      tagFilters: [],
      tags: (this.props.sessions as Session[])
        .selectMany(s => s.Tags)
        .unique()
        .sort(),
      votes: [],
    })
  }

  componentDidMount() {
    this.setState({
      flagged: this.readFromStorage('ddd-voting-session-flagged'),
      shortlist: this.readFromStorage('ddd-voting-session-shortlist'),
      submitted: this.readFromStorage('ddd-voting-submitted') === 'true',
      votes: this.readFromStorage('ddd-voting-session-votes'),
    })
  }

  toggleExpandAll() {
    this.setState({ expandAll: !this.state.expandAll })
  }

  show(whatToShow: string) {
    this.setState({ show: whatToShow })
  }

  isInShortlist(session: Session) {
    return this.state.shortlist.includes(session.Id)
  }

  toggleShortlist(session: Session) {
    logEvent('voting', this.isInShortlist(session) ? 'unshortlist' : 'shortlist', {
      id: this.props.voteId,
      sessionId: session.Id,
    })
    this.setState(
      {
        shortlist: this.isInShortlist(session)
          ? this.state.shortlist.without(session.Id)
          : [...this.state.shortlist, session.Id],
      },
      () => this.writeToStorage('ddd-voting-session-shortlist', this.state.shortlist),
    )
  }

  isFlagged(session: Session) {
    return this.state.flagged.includes(session.Id)
  }

  toggleFlagged(session: Session) {
    logEvent('voting', this.isFlagged(session) ? 'unflag' : 'flag', { sessionId: session.Id, id: this.props.voteId })
    this.setState(
      {
        flagged: this.isFlagged(session) ? this.state.flagged.without(session.Id) : [...this.state.flagged, session.Id],
      },
      () => this.writeToStorage('ddd-voting-session-flagged', this.state.flagged),
    )
  }

  isVotedFor(session: Session) {
    return this.state.votes.includes(session.Id)
  }

  toggleVote(session: Session) {
    logEvent('voting', this.isVotedFor(session) ? 'unvote' : 'vote', { sessionId: session.Id, id: this.props.voteId })
    this.setState(
      {
        votes: this.isVotedFor(session) ? this.state.votes.without(session.Id) : [...this.state.votes, session.Id],
      },
      () => this.writeToStorage('ddd-voting-session-votes', this.state.votes),
    )
  }

  writeToStorage(key: string, value: string | string[]) {
    if (localStorage) {
      if (value instanceof String) {
        localStorage.setItem(key, value as string)
      }
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  readFromStorage(key: string) {
    if (localStorage) {
      const data = localStorage.getItem(key)
      if (data != null) {
        return JSON.parse(data)
      }
    }
    return []
  }

  async submit() {
    const vote = {
      Id: this.props.voteId,
      Indices: this.state.votes.map(id => this.props.sessions.indexOf(this.props.sessions.find(s => s.Id === id)) + 1),
      SessionIds: this.state.votes,
      TicketNumber: this.state.ticketNumber,
      VoterSessionId: getSessionId(),
      VotingStartTime: this.props.startTime,
    }
    const headers: any = { 'Content-Type': 'application/json' }
    this.setState({ submitInProgress: true, submitError: false })
    try {
      const response = await fetch(this.props.submitVoteUrl, {
        body: JSON.stringify(vote),
        headers,
        method: 'POST',
      })

      if (!response.ok) {
        logException(
          'Error when submitting vote',
          new Error(`Got ${response.status} ${response.statusText} when posting vote.`),
          { voteId: this.props.voteId },
        )
        this.setState({ submitInProgress: false, submitError: true })
      } else {
        logEvent(
          'voting',
          'submit',
          { startTime: this.props.startTime, id: this.props.voteId },
          { votingDurationInMins: moment().diff(moment.parseZone(this.props.startTime), 'minutes') },
        )
        this.setState({ submitInProgress: false, submitted: true }, () =>
          this.writeToStorage('ddd-voting-submitted', 'true'),
        )
      }
    } catch (e) {
      logException('Error when submitting vote', e, { voteId: this.props.voteId })
      this.setState({ submitInProgress: false, submitError: true })
    }
  }

  render() {
    const visibleSessions = (this.props.sessions || [])
      .filter(
        s =>
          this.state.show !== 'all' ||
          (this.state.tagFilters.length === 0 || this.state.tagFilters.some(t => s.Tags.includes(t))),
      )
      .filter(
        s =>
          this.state.show !== 'all' ||
          (this.state.levelFilters.length === 0 || this.state.levelFilters.some(l => s.Level === l)),
      )
      .filter(
        s =>
          this.state.show !== 'all' ||
          (this.state.formatFilters.length === 0 || this.state.formatFilters.some(f => s.Format === f)),
      )
      .filter(s => this.state.show !== 'shortlist' || this.isInShortlist(s))
      .filter(s => this.state.show !== 'votes' || this.isVotedFor(s))

    const SpanIf: React.StatelessComponent<any> = ({ condition, className, children }) => (
      <React.Fragment>
        {condition && <span className={className}>{children}</span>}
        {!condition && children}
      </React.Fragment>
    )

    const option = text => (
      <div>
        <span className="fa fa-check-circle-o selected-marker" />
        <span className="fa fa-circle-o not-selected-marker" />
        <span> {text}</span>
      </div>
    )

    return (
      <React.Fragment>
        <NonJumpingAffix>
          <Panel className="voting-control form-inline">
            <Panel.Heading>
              {this.state.submitted && (
                <p className="alert alert-success">
                  You've submitted your vote for this year :) Thanks! &lt;3 DDD Perth team
                </p>
              )}
              {!this.state.submitted && (
                <React.Fragment>
                  <h3>Vote</h3>
                  <div className="submit-block">
                    <label>
                      Ticket order #{' '}
                      <em>
                        {' '}
                        <span
                          className="fa fa-question-circle"
                          style={{ cursor: 'pointer', fontSize: '20px' }}
                          title="Your vote will have a higher weighting if you optionally supply your ticket # from your ticket confirmation email when getting an attendee ticket."
                          onClick={() =>
                            alert(
                              'Your vote will have a higher weighting if you optionally supply your ticket # from your ticket confirmation email when getting an attendee ticket.',
                            )
                          }
                        />
                      </em>
                      :{' '}
                      <input
                        type="text"
                        className="form-control input-sm"
                        onChange={e => this.setState({ ticketNumber: e.target.value })}
                        value={this.state.ticketNumber}
                        placeholder="Optional"
                      />
                    </label>{' '}
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={this.state.votes.length < this.props.minVotes || this.state.submitInProgress}
                      onClick={() => this.submit()}
                    >
                      {this.state.submitInProgress ? (
                        'Submitting...'
                      ) : (
                        <React.Fragment>
                          Submit <span className="remove-when-small">votes</span> ({this.state.votes.length}/
                          {this.props.minVotes !== this.props.maxVotes
                            ? `${Math.max(this.props.minVotes, this.state.votes.length)}${
                                this.state.votes.length < this.props.maxVotes ? '+' : ''
                              }`
                            : this.props.minVotes}
                          )
                        </React.Fragment>
                      )}
                    </button>
                  </div>
                  <div style={{ clear: 'both' }} />
                </React.Fragment>
              )}
              {this.state.submitError && (
                <React.Fragment>
                  <br />
                  <span className="alert alert-danger" style={{ padding: '2px' }}>
                    There was a problem submitting your votes; please try again or refresh the page and try again.
                  </span>
                </React.Fragment>
              )}
            </Panel.Heading>
            <Panel.Body>
              <em>View:</em>{' '}
              <div className="btn-group" role="group">
                <button
                  className="btn btn-sm agenda"
                  onClick={() => this.show('all')}
                  disabled={this.state.show === 'all'}
                >
                  All sessions ({this.props.sessions.length})
                </button>{' '}
                <button
                  className="btn btn-sm agenda"
                  onClick={() => this.show('shortlist')}
                  disabled={this.state.show === 'shortlist'}
                >
                  My shortlist ({this.state.shortlist.length})
                </button>{' '}
                <button
                  className="btn btn-sm agenda"
                  onClick={() => this.show('votes')}
                  disabled={this.state.show === 'votes'}
                >
                  My votes ({this.state.votes.length})
                </button>
              </div>
              {this.state.show === 'all' && (
                <React.Fragment>
                  <div className="filters">
                    <em>Filter by:</em>{' '}
                    <ReactResponsiveSelect
                      name="tagsFilter"
                      prefix="Tags:"
                      options={[{ value: null, text: 'All', markup: option('All') }].concat(
                        this.state.tags.map(t => ({ value: t, text: t, markup: option(t) })),
                      )}
                      multiselect={true}
                      caretIcon={<span className="fa fa-caret-down" />}
                      onChange={selected => {
                        const newFilter = selected.options.map(o => o.value).filter(o => o !== null)
                        if (newFilter.length > 0) {
                          logEvent('voting', 'tagFilter', { filter: newFilter.join(',') })
                        }
                        this.setState({ tagFilters: newFilter })
                      }}
                      selectedValues={this.state.tagFilters.length > 0 ? this.state.tagFilters : undefined}
                    />
                    <ReactResponsiveSelect
                      name="formatFilter"
                      prefix="Format:"
                      options={[{ value: null, text: 'All', markup: option('All') }].concat(
                        this.state.formats.map(f => ({ value: f, text: f, markup: option(f) })),
                      )}
                      multiselect={true}
                      caretIcon={<span className="fa fa-caret-down" />}
                      onChange={selected => {
                        const newFilter = selected.options.map(o => o.value).filter(o => o !== null)
                        if (newFilter.length > 0) {
                          logEvent('voting', 'formatFilter', { filter: newFilter.join(',') })
                        }
                        this.setState({ formatFilters: newFilter })
                      }}
                      selectedValues={this.state.formatFilters.length > 0 ? this.state.formatFilters : undefined}
                    />
                    <ReactResponsiveSelect
                      name="levelsFilter"
                      prefix="Level:"
                      options={[{ value: null, text: 'All', markup: option('All') }].concat(
                        this.state.levels.map(l => ({ value: l, text: l, markup: option(l) })),
                      )}
                      multiselect={true}
                      caretIcon={<span className="fa fa-caret-down" />}
                      onChange={selected => {
                        const newFilter = selected.options.map(o => o.value).filter(o => o !== null)
                        if (newFilter.length > 0) {
                          logEvent('voting', 'levelFilter', { filter: newFilter.join(',') })
                        }
                        this.setState({ levelFilters: newFilter })
                      }}
                      selectedValues={this.state.levelFilters.length > 0 ? this.state.levelFilters : undefined}
                    />
                  </div>
                </React.Fragment>
              )}
            </Panel.Body>
          </Panel>
        </NonJumpingAffix>
        <h2>
          {this.state.show === 'all' ? 'All sessions' : this.state.show === 'shortlist' ? 'My shortlist' : 'My votes'}{' '}
          <small>{`(showing ${visibleSessions.length}${
            this.state.show === 'all' ? '/' + this.props.sessions.length : ''
          } session(s))`}</small>{' '}
          <button className="btn btn-sm btn-secondary" onClick={() => this.toggleExpandAll()}>
            {this.state.expandAll ? 'Hide all session details' : 'Show all session details'}
          </button>
        </h2>
        {visibleSessions.length === 0 && (
          <p>
            <em>No sessions yet.</em>
          </p>
        )}
        <PanelGroup accordion={!this.state.expandAll} className="accordion" id="voting-interface">
          {visibleSessions.map((s, i) => (
            <Panel eventKey={i} key={i} expanded={this.state.expandAll || null}>
              <Panel.Heading>
                <Panel.Title toggle={!this.state.expandAll}>
                  <SpanIf condition={this.state.expandAll} className="title">
                    {this.isVotedFor(s) && (
                      <span className="fa fa-check status" aria-label="Voted" role="status" title="Voted" />
                    )}
                    {this.isInShortlist(s) && (
                      <span
                        className="fa fa-list-ol status"
                        aria-label="Shortlisted"
                        role="status"
                        title="Shortlisted"
                      />
                    )}
                    {this.isFlagged(s) && (
                      <span className="fa fa-flag status" aria-label="Flag" role="status" title="Flagged" />
                    )}
                    {s.Title}
                    <br />
                    {(s.Tags || []).map(tag => (
                      <React.Fragment key={tag}>
                        <span className="badge">{tag}</span>{' '}
                      </React.Fragment>
                    ))}
                    <small
                      style={{
                        display: 'block',
                        marginTop: '10px',
                        visibility: this.state.expandAll ? 'hidden' : 'visible',
                      }}
                    >
                      <span className="fa fa-plus" title="More details" /> Tap for session details
                    </small>
                    {!this.state.submitted && (
                      <div style={{ textAlign: 'right', paddingTop: '10px' }}>
                        <button
                          onClick={e => {
                            this.toggleFlagged(s)
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          {!this.isFlagged(s) ? 'Flag' : 'Un-flag'}
                        </button>{' '}
                        <button
                          onClick={e => {
                            this.toggleShortlist(s)
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          {!this.isInShortlist(s) ? 'Shortlist' : 'Un-shortlist'}
                        </button>{' '}
                        <button
                          onClick={e => {
                            this.toggleVote(s)
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                          className="btn btn-primary btn-sm"
                          disabled={this.state.votes.length >= this.props.maxVotes && !this.isVotedFor(s)}
                        >
                          {!this.isVotedFor(s) ? 'Vote' : 'Un-vote'}
                        </button>
                      </div>
                    )}
                  </SpanIf>
                </Panel.Title>
              </Panel.Heading>
              <Panel.Body collapsible>
                <SessionDetails
                  session={s}
                  showPresenter={!this.props.anonymousVoting}
                  hideTags={true}
                  showBio={false}
                  hideLevelAndFormat={false}
                />
              </Panel.Body>
            </Panel>
          ))}
        </PanelGroup>
      </React.Fragment>
    )
  }
}
