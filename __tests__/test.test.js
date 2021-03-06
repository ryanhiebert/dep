// Packages
const metadata = require('probot-metadata')
const { createRobot } = require('probot')

// Ours
const app = require('../index')
const events = require('./events')

// Globals
let robot, github

// Mock everything
beforeEach(() => {
  // Here we create a robot instance
  robot = createRobot()

  // Here we initialize the app on the robot instance
  app(robot)

  // Mock GitHub client
  github = {
    issues: {
      get: jest
        .fn()
        .mockReturnValueOnce({ data: { state: 'closed' } })
        .mockReturnValue({ data: { state: 'open' } }),
      getForRepo: jest
        .fn()
        .mockReturnValue({ data: [{ number: 1, pull_request: {} }] })
    },
    pullRequests: {
      get: jest.fn().mockReturnValue({ data: { head: { sha: '123' } } })
    },
    paginate: (fn, cb) => cb(fn),
    repos: { createStatus: jest.fn() }
  }

  // Passes the mocked out GitHub API into out robot instance
  robot.auth = () => Promise.resolve(github)
})

test('getting stored metadata', async () => {
  await robot.receive(events.pull_request_opened)
  expect(metadata().get).toHaveBeenCalledWith('dependencies')

  await robot.receive(events.pull_request_reopened)
  expect(metadata().get).toHaveBeenLastCalledWith('dependencies')

  await robot.receive(events.pull_request_synchronize)
  expect(metadata().get).toHaveBeenLastCalledWith('dependencies')
})
