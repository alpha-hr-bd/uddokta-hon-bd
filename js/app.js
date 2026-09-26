import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { PACKAGES, PRODUCTS, WHATSAPP } from "./data.js";

const pgrid=document.querySelector("#packagesGrid"), grid=document.querySelector("#productsGrid");
pgrid.innerHTML=PACKAGES.map((p,i)=>`<article class="package ${i===2?"featured":""}"><p class="eyebrow">${i===2?"POPULAR":"ACTIVATION"}</p><h3>${p.name}</h3><div class="price">৳${p.price.toLocaleString()}</div><p class="muted">${p.desc}</p><button class="btn primary wide" data-pkg="${p.id}">Choose package</button></article>`).join("");
grid.innerHTML=PRODUCTS.map(p=>`<article class="product"><img src="${p.img}" alt=""><p class="muted">${p.category}</p><h3>${p.name}</h3><div id="price-${p.id}" class="lock">🔒 Activate Account to View Price</div></article>`).join("");

let currentUser=null,currentProfile=null;
onAuthStateChanged(auth,async(user)=>{
 currentUser=user;
 document.querySelector("#authLink").textContent=user?"Dashboard":"Login";
 document.querySelector("#dashLink").style.display=user?"inline":"none";
 if(user){
   const s=await getDoc(doc(db,"users",user.uid)); currentProfile=s.exists()?s.data():null;
   document.querySelector("#heroStatus").textContent=currentProfile?.status==="active"?"Active":"Pending";
   document.querySelector("#heroId").textContent=currentProfile?.uniqueId||"";
   if(currentProfile?.status==="active"){
     PRODUCTS.forEach(p=>document.querySelector(`#price-${p.id}`).outerHTML=`<div class="price">৳${p.price.toLocaleString()}</div>`);
   }
 }
});
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-pkg]"); if(!b)return;
 const p=PACKAGES.find(x=>x.id===b.dataset.pkg);
 if(!currentUser){location.href="login.html";return;}
 const id=currentProfile?.uniqueId||"Pending ID";
 const text=`Assalamu Alaikum, I want to activate my UddoktaHon account.%0A%0AUnique ID: ${id}%0APackage: ${p.name}%0APackage Price: ৳${p.price.toLocaleString()}%0AName: ${currentProfile?.name||""}%0AEmail: ${currentProfile?.email||currentUser.email||""}%0A%0APlease confirm my activation order.`;
 location.href=`https://wa.me/${WHATSAPP}?text=${text}`;
});
