const localStrats = require('passport-local').Strategy
const bcrypt = require('bcrypt')


function passinit(passport, valUSER, valID){
    const authUser = async (username, password, done) => {
        const user = valUSER(username)
        if (user == null){
            return done(null, false, {message: 'user not found'})
        }

        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {message: 'password incorrect'})
            }
        } catch(err) {
            return done(err)
        }
    }

    passport.use(new localStrats({usernameField: 'username', passReqToCallBack: true}, authUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, valID(id))
    })
}

module.exports = passinit