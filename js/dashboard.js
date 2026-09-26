import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { PACKAGES } from "./data.js";

const $=s=>document.querySelector(s);
$("#packageSelect").innerHTML=PACKAGES.map(p=>`<option value="${p.id}">${p.name} — ৳${p.price.toLocaleString()}</option>`).join("");
$("#logoutBtn").onclick=()=>signOut(auth).then(()=>location.href="index.html");

onAuthStateChanged(auth,async(user)=>{
 if(!user){location.href="login.html";return;}
 const snap=await getDoc(doc(db,"users",user.uid));
 if(!snap.exists()){location.href="index.html";return;}
 const me=snap.data();
 $("#uidCode").textContent=me.uniqueId;
 $("#pkg").textContent=PACKAGES.find(p=>p.id===me.packageId)?.name||"Not activated";
 $("#accountState").textContent=me.status==="active"?"Active":"Pending";
 $("#statusBadge").textContent=me.status==="active"?"Active":"Pending";
 $("#statusBadge").className=`badge ${me.status==="active"?"active":"pending"}`;
 $("#activationText").textContent=me.status==="active"?"Your account is active. Product prices are unlocked.":`Account ${me.uniqueId} is pending activation. Choose a package and send the WhatsApp request.`;
 if(me.role==="admin"){$("#adminPanel").classList.remove("hidden");}
});

$("#activateForm").onsubmit=async e=>{
 e.preventDefault(); const code=$("#searchCode").value.trim();
 const q=query(collection(db,"users"),where("uniqueId","==",code)); const s=await getDocs(q);
 if(s.empty){$("#adminMsg").textContent="User not found.";return;}
 const selected=$("#packageSelect").value;
 await updateDoc(s.docs[0].ref,{status:"active",packageId:selected,activatedAt:new Date()});
 $("#adminMsg").textContent=`${code} activated successfully.`;
};
