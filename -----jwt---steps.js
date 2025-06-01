/**
 * Simple but not the best way
 * 1. from client side sent information. 
 * 2. generate token jwt.sign()
 * 3. on the client side set token to the localstorage
 * 
*/


/* 
    using http only cookies

    1. from client side send the information (email, better: firebase er auth token) to generate token
    2. on the server side, accept user information and if needed validate it
    3. generate token in the server side using secret and expiresIn

    ----------
    set the token to the cookies
    4. while calling the api tell to use withCredentials

     axios.post('http://localhost:3000/jwt', userData, {
                    withCredentials: true
                })

    or for fetch add option {credentials: 'include'}


    5. in the cors setting set credentials and origin

    app.use(cors({
      origin: ['http://localhost:5173'],
      credentials: true
    }));

    6. after generating the token set it to the cookies with some options

    res.cookie('token', token, {
        httpOnly: true,
        secure: false
      })


      ---------------
    7.  on time: use cookiesParser as middleware 
    8. for every api you want to verify token:  in the client side: if using axios withCredentials: true
    for fetch: credentials include

    -------------
    verify token 
    8. check token exists. if not, return 401 --> unauthorized
    9. jwt.verify function. if err return 401 --> unauthorized
    10. if token is valid set the decoded value to the req object
    11. if data asking for doesn't match with the owner or bearer of the token --> 403 --> forbidden access

*/