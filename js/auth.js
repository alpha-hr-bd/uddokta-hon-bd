import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const form=document.querySelector("#authForm"), nameEl=document.querySelector("#name"), email=document.querySelector("#email"), pass=document.querySelector("#password");
const title=document.querySelector("#formTitle"), sub=document.querySelector("#formSub"), btn=document.querySelector("#submitBtn"), sw=document.querySelector("#switchBtn"), swText=document.querySelector("#switchText"), msg=document.querySelector("#msg");
let signup=true;

function showError(e){msg.textContent=e?.message?.replace("Firebase: ","")||"Something went wrong";msg.style.color="#b42318";}
sw.onclick=()=>{signup=!signup; title.textContent=signup?"Create your account":"Welcome back";sub.textContent=signup?"Your unique UDD ID will be generated automatically.":"Login to your business dashboard.";btn.textContent=signup?"Sign up":"Login";swText.textContent=signup?"Already have an account?":"Don't have an account?";sw.textContent=signup?"Login":"Sign up";nameEl.parentElement.style.display=signup?"block":"none";nameEl.required=signup;msg.textContent=""};

form.onsubmit=async(e)=>{
 e.preventDefault(); msg.textContent="Please wait…";
 try{
  if(!signup){await signInWithEmailAndPassword(auth,email.value.trim(),pass.value);location.href="dashboard.html";return;}
  const cred=await createUserWithEmailAndPassword(auth,email.value.trim(),pass.value);
  const ref=doc(db,"counters","users");
  const userRef=doc(db,"users",cred.user.uid);
  await runTransaction(db,async(tx)=>{
    const snap=await tx.get(ref);
    const next=(snap.exists()?snap.data().next:1001);
    tx.set(ref,{next:next+1},{merge:true});
    tx.set(userRef,{uid:cred.user.uid,name:nameEl.value.trim(),email:email.value.trim(),uniqueId:`UDD-${next}`,status:"pending",packageId:null,createdAt:serverTimestamp()});
  });
  location.href="dashboard.html";
 }catch(e){showError(e)}
};
