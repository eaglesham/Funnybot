module.exports = function(bp) {

  const utterances = {
    yes: /yes|ya|sure|yeah|definitely|please/i,
    no: /no|nah|nope/i,
    stop: /stop|cancel|abort/i
  }

  const confused = 'Sorry I dont understand. I may seem advanced but I\'m actually pretty stupid.'

  bp.hear(utterances.stop, (event, next) => {
    const convo = bp.convo.find(event)
    convo && convo.stop('aborted')
  })

  bp.hear(/hello|hi|test|hey|holla/i, (event, next) => {
    event.reply('#welcome') 
  })

  const remember_regex = /remember the joke (.+)/i
  
  //bot will store joke in db
  bp.hear(remember_regex, (event, next) => { 
    let matches = remember_regex.exec(event.text)

    bp.db.kvs.get('reminders').then(reminders => {
      
      if (!reminders) {
        reminders =[]
      }
      
      event.reply('#remember')
      let reminder = matches[1]
      reminders.push(reminder);

      bp.db.kvs.set('reminders', reminders)
    })
  })

  //bot will recall list of favourite
  bp.hear(/favourite jokes|favorite jokes/i, (event, next) => {
    bp.db.kvs.get('reminders').then(reminders => {
      if (!reminders) {
        reminders =[]
      }
      
      event.reply('#yourfavourites')

      reminders.forEach(function(reminder) {
        event.reply('#favourites', { favourite: reminder } )
      })
    })
  })
  
  //starts 'tell me a joke' convo
  bp.hear(/tell me a joke/i, (event, next) => {
    
    bp.convo.start(event, convo => {
      convo.threads['default'].addQuestion('#telljokes', [
        {
          pattern: 'tech',
          callback: () => {
            convo.switchTo('tech')
          }
        },
        {
          pattern: 'one liner',
          callback: () => {
            convo.switchTo('oneliner')
          }
        },
        {
          pattern: 'animal',
          callback: () => {
            convo.switchTo('animal')
          }
        },
        {
          pattern: /surprise me/i,
          callback: () => {
            convo.switchTo('surprise')
          }
        },
        {
          default: true,
          callback: () => {
    
            convo.say(confused)
    
            // Repeats the last question / message
            convo.repeat()
          }
        }
      ])
   
      convo.createThread('tech')
      convo.threads['tech'].addMessage('#techjokes')
      convo.threads['tech'].addQuestion('Would you like to hear another tech joke?', [
        {
          pattern: utterances.yes,
          callback: () => {
            convo.say('#techjokes')
            convo.repeat()
          }
        }, 
        {
          pattern: utterances.no,
          callback: () => {
            convo.next()
          }
        },
        {
          default: true,
          callback: () => {
    
            convo.say(confused)

            convo.repeat()
          }
        }
      ])
    
      convo.createThread('oneliner')
      convo.threads['oneliner'].addMessage('#onelinerjokes')
      convo.threads['oneliner'].addQuestion('Would you like to hear another oneliner joke?', [
        {
          pattern: utterances.yes,
          callback: () => {
            convo.say('#onelinerjokes')
            convo.repeat()
          }
        }, 
        {
          pattern: utterances.no,
          callback: () => {
            convo.next()          
          }
        },
        {
          default: true,
          callback: () => {
    
            convo.say(confused)

            convo.repeat()
          }
        }
      ])

      convo.createThread('surprise')
      convo.threads['surprise'].addMessage('#randomjokes')
      convo.threads['surprise'].addQuestion('Would you like to hear another random joke?', [
        {
          pattern: utterances.yes,
          callback: () => {
            convo.say('#randomjokes')
            convo.repeat()
          }
        }, 
        {
          pattern: utterances.no,
          callback: () => {
            convo.next()
          }
        },
        {
          default: true,
          callback: () => {
    
            convo.say(confused)

            convo.repeat()
          }
        }
      ])
      
      convo.createThread('animal')
      convo.threads['animal'].addMessage('#animaljokes')
      convo.threads['animal'].addQuestion('Would you like to hear another animal joke?', [
        {
          pattern: utterances.yes,
          callback: () => {
            convo.say('#animaljokes')
            convo.repeat()
          }
        }, 
        {
          pattern: utterances.no,
          callback: () => {
            convo.next()
          }
        },
        {
          default: true,
          callback: () => {
    
            convo.say(confused)

            convo.repeat()
          }
        }
      ])
      
      convo.on('done', () => {
        convo.say('Sure thing. Let me know when you would like to hear another joke.')
      })
    })
  
  })

  bp.hear({
    type: /message|text/i,
    text: /exit|bye|goodbye|quit|done|leave|stop/i
  }, (event, next) => {
    event.reply('#goodbye', {
      // You can pass data to the UMM bloc!
      reason: "you think you are funny enough already."
    })
  })


}
