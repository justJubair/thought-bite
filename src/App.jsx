import "./App.css";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { useState } from "react";
import auth from "./firebase/firebase.config";

import logo from "./assets/logo.png"
import axios from "axios";
import { useQuery } from "@tanstack/react-query";


function App() {
  const [user, setUser] = useState({});
  //  sign in with google
  const googleProvider = new GoogleAuthProvider();
  const handleSignIn = () => {
    signInWithPopup(auth, googleProvider)
      .then(() => {
        
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // sign out
  const handleSignOut = () => {
    signOut(auth)
      .then()
      .catch((error) => {
        console.log(error);
      });
  };

  // setup a observer for user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      return () => {
        unsubscribe();
      };
    });
  }, []);


  // ChatRoom component
  const ChatRoom = () => {
    const dummy = useRef()
    const {data:messages, refetch} = useQuery({
      enabled: !!user,
      queryKey: [user, "message"],
      queryFn: async()=>{
        const res = await axios.get("https://thought-bite-server.vercel.app/messages")
        return res.data
      }
    })
    const [formValue, setFormValue] = useState('')

    const sendMessage = async(e)=>{
      e.preventDefault()
      const {email, photoURL} = auth.currentUser;
      
      try{
        await axios.post("https://thought-bite-server.vercel.app/messages", {text:formValue, email, photoURL})
        refetch()
      }
      catch(err){
        console.log("Message posting error", err)
      }
   
      setFormValue("")
      dummy.current.scrollIntoView({behavior: "smooth"})
    }

    return(
      <div>
       <main>
       {messages && messages.map((msg, index)=> <ChatMessage key={index} message={msg}/>)}
       <span ref={dummy} ></span>
       </main>

         <form onSubmit={sendMessage}>
          <input value={formValue} onChange={e=> setFormValue(e.target.value)} type="text" name="message" id="message" required/>
          <label htmlFor="
          ">
            <input className="image_field" type="file" name="" id="" />
            imgage
          </label>
          <button type="submit">Send</button>
         </form>
      </div>
    )}

    // ChatMessage Component
    const ChatMessage = ({message}) => {
        const {text, email, photoURL}  = message
     const messageClass = email === auth?.currentUser?.email ? "sent" : "received";

      return(
       <div className={`message ${messageClass}`}>
        <img src={photoURL} alt="" />
        <p>{text}</p>
       </div>
      )}
      ChatMessage.propTypes={
        message:PropTypes.object
      }
 
    //Sign in component
    const SignIn = () => {
      return(
        <>
            <button className="sign-in" onClick={handleSignIn}>Sign in</button>
        </>
      )}
   
  return (
    <>
      <div className="App">
        <header>
         <div className="logo-title">
          <img className="logo" src={logo} alt="" />
         <h3 className="brand-title">Thought Bite</h3>
         </div>
          {
            user &&  <button className="sign-out" onClick={handleSignOut}>Sign out</button>
          }
        </header>
        

       <section>
        {user ? <ChatRoom/> : <SignIn/>}
       </section>
      </div>
    </>
  );
}

export default App;
