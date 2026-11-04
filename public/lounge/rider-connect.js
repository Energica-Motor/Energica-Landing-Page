'use strict';
const riderOrigin='https://lounge.energicamotor.com';
let scanCleanup=null;
function stopScan(){if(scanCleanup){scanCleanup();scanCleanup=null}}
function contactDetails(value){
 const text=value.trim(),phone=text.replace(/[ ()-]/g,'');
 if(/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(text)&&text.length<=150)return{email:text,phone:''};
 if(/^\+[1-9]\d{6,14}$/.test(phone))return{email:'',phone};
 throw Error('Enter an email or an international phone number starting with +.');
}
function riderData(person,contacts=false){
 const data={v:1,id:person.sourceId||person.id,name:person.name,bike:person.bike||'',pace:person.pace||'Relaxed touring'};
 if(contacts){if(person.email)data.email=person.email;if(person.phone)data.phone=person.phone}
 return data;
}
function myRider(){
 if(!state.profile.riderId){state.profile.riderId=uid('profile');write('profile',state.profile)}
 return{id:state.profile.riderId,name:state.profile.name||'Rider',bike:currentBike().model,pace:state.profile.pace,email:state.profile.email||'',phone:state.profile.phone||''};
}
function riderLink(data){return riderOrigin+'/#rider='+btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(data)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function parseRider(value){
 if(typeof value!=='string'||value.length>6000)throw Error('Use an Energica rider link.');
 const url=new URL(value,riderOrigin);
 if(![riderOrigin,location.origin].includes(url.origin)||!/^#rider=[A-Za-z0-9_-]+$/.test(url.hash))throw Error('This is not an Energica rider QR.');
 let data;
 try{let token=url.hash.slice(7).replace(/-/g,'+').replace(/_/g,'/');data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(token+'='.repeat((4-token.length%4)%4)),c=>c.charCodeAt(0))))}catch{throw Error('This rider code could not be read.')}
 if(!data||data.v!==1||typeof data.id!=='string'||!/^[\w-]{1,100}$/.test(data.id)||typeof data.name!=='string'||!data.name.trim()||data.name.length>80)throw Error('This rider card is incomplete.');
 const card={id:data.id,name:data.name.trim()};
 for(const field of ['bike','pace'])if(typeof data[field]==='string')card[field]=data[field].slice(0,80);
 if(data.email){card.email=contactDetails(data.email).email;if(!card.email)throw Error('Invalid email in rider card.')}
 if(data.phone){card.phone=contactDetails(data.phone).phone;if(!card.phone)throw Error('Invalid phone in rider card.')}
 return card;
}
function matchingRider(card){return knownRiders.find(r=>(card.id&&(r.id===card.id||r.sourceId===card.id))||(card.email&&r.email?.toLowerCase()===card.email.toLowerCase())||(card.phone&&r.phone?.replace(/[ ()-]/g,'')===card.phone))}
function showQR(id){
 const person=id?knownRiders.find(r=>r.id===id):myRider();if(!person)return;
 openModal(`<span class="eyebrow">ENERGICA RIDER CARD</span><h2>${id?esc(person.name):'My QR code'}</h2><p class="modal-intro">Scan with a phone camera or use Scan QR in Community to add this rider.</p><div class="qr-card"><b>${esc(person.name)}</b><small>${esc(person.bike||'Motorcycle enthusiast')}</small><canvas id="rider-code" role="img" aria-label="QR code for ${esc(person.name)}"></canvas><small>ENERGICA · PEOPLE &amp; PASSION</small></div>${person.email||person.phone?'<label class="qr-consent"><input id="qr-contact" type="checkbox"> Include phone / email in this card</label>':''}<p class="local-note">Anyone with this code can read the included details. Private notes are never included.</p><div class="connect-actions"><button class="primary" id="share-code">Share</button><button class="secondary" id="copy-code">Copy link</button><button class="secondary" id="save-code">Save QR</button></div><p id="qr-status" role="status" class="local-note"></p><details><summary>Rider link</summary><label class="field">Shareable link<input id="code-link" readonly></label></details>`);
 const canvas=$('#rider-code'),status=$('#qr-status');let link;
 function draw(){
  link=riderLink(riderData(person,!!$('#qr-contact')?.checked));$('#code-link').value=link;
  const qr=qrcode(0,'M');qr.addData(link);qr.make();const n=qr.getModuleCount(),scale=8;
  canvas.width=canvas.height=(n+8)*scale;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#11150f';
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))ctx.fillRect((x+4)*scale,(y+4)*scale,scale,scale);
 }
 async function copy(){try{await navigator.clipboard.writeText(link);status.textContent='Rider link copied.'}catch{$('#code-link').closest('details').open=true;$('#code-link').select();status.textContent='Copy the selected rider link.'}}
 if($('#qr-contact'))$('#qr-contact').onchange=draw;
 $('#copy-code').onclick=copy;
 $('#share-code').onclick=async()=>{if(!navigator.share)return copy();try{await navigator.share({title:person.name+' · Energica',url:link})}catch(e){if(e.name!=='AbortError')copy()}};
 $('#save-code').onclick=()=>canvas.toBlob(blob=>{if(blob)download(blob,'energica-rider-qr.png','image/png')},'image/png');draw();
}
function addRiderQuick(){
 openModal(`<span class="eyebrow">YOUR COMMUNITY</span><h2>Add a rider</h2><div class="connect-actions"><button class="secondary" id="scan-instead"><i data-lucide="scan-line"></i> Scan QR instead</button><button class="secondary" id="show-my-code">My QR</button></div><p class="modal-intro">Just a number or email. Add a name if you like.</p><form id="quick-rider-form"><label class="field">Phone number or email<input name="contact" maxlength="150" required placeholder="+39 333 123 4567 or rider@example.com"></label><label class="field">Name (optional)<input name="name" maxlength="80" placeholder="Rider name"></label><div class="form-actions"><button class="secondary" type="submit" value="save">Just add rider</button><button class="primary" type="submit" value="invite">Prepare invitation</button></div></form><p class="local-note">Invitations open in your email, SMS or WhatsApp for you to send.</p><button class="text-button" id="full-rider-details">Add full details instead</button>`);
 $('#scan-instead').onclick=scanRider;$('#show-my-code').onclick=()=>showQR();$('#full-rider-details').onclick=()=>editRider();
 const input=$('#quick-rider-form input[name="contact"]');input.oninput=()=>input.setCustomValidity('');
 $('#quick-rider-form').onsubmit=e=>{
  e.preventDefault();let contact;try{contact=contactDetails(input.value)}catch(error){input.setCustomValidity(error.message);input.reportValidity();return}
  const name=new FormData(e.target).get('name').trim();let rider=matchingRider(contact);
  if(!rider){rider={id:uid('rider'),name:name||contact.email||contact.phone,...contact,location:'',bike:'',pace:'Relaxed touring',notes:''};knownRiders.push(rider)}else if(name)rider.name=name;
  write('known-riders',knownRiders);renderRiders();if(e.submitter?.value==='save'){closeModal();toast('Rider added.')}else quickInvitation(rider);
 };
}
function quickInvitation(person){
 const message='Let’s ride together. Add me to your Energica riding circle:\n'+riderLink(riderData(myRider()))+'\n\n'+state.profile.name;
 openModal(`<span class="eyebrow">REVIEW INVITATION</span><h2>Ready to connect</h2><p class="modal-intro">To ${esc(person.name)}<br>${esc(person.email||person.phone)}</p><label class="field">Invitation message<textarea id="quick-message" rows="6">${esc(message)}</textarea></label><div class="connect-actions" id="quick-channels"></div><p class="local-note">Draft only. You send the invitation in your chosen app.</p>`);
 function render(){const text=encodeURIComponent($('#quick-message').value),phone=person.phone.replace(/\D/g,'');$('#quick-channels').innerHTML=person.email?`<a class="primary" href="mailto:${encodeURIComponent(person.email)}?subject=Join%20my%20Energica%20riding%20circle&amp;body=${text}">Open email</a>`:`<a class="primary" href="https://wa.me/${phone}?text=${text}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a class="secondary" href="sms:+${phone}?body=${text}">Open SMS</a>`}
 $('#quick-message').oninput=render;render();
}
function reviewRider(value,status){
 let card;try{card=parseRider(value)}catch(e){if(status)status.textContent=e.message;else{scanRider();$('#scan-status').textContent=e.message}return false}
 if(card.id===state.profile.riderId){if(status)status.textContent='This is your own card. Share it with another rider.';else showQR();return false}
 const existing=matchingRider(card);
 openModal(`<span class="eyebrow">REVIEW RIDER CARD</span><h2>${esc(card.name)}</h2><div class="rider-review">${['bike','pace','email','phone'].filter(k=>card[k]).map(k=>`<p><small>${k.toUpperCase()}</small>${esc(card[k])}</p>`).join('')}</div><p class="local-note">${existing?'This rider is already in your circle. Update their shared details without changing your private notes.':'Review these shared details before adding the rider.'}</p><div class="form-actions"><button class="secondary" id="cancel-add">Cancel</button><button class="primary" id="confirm-add">${existing?'Update rider':'Add rider'}</button></div>`);
 $('#cancel-add').onclick=closeModal;$('#confirm-add').onclick=()=>{const{id,...fields}=card;if(existing)Object.assign(existing,fields,{sourceId:id});else knownRiders.push({id:uid('rider'),sourceId:id,location:'',email:'',phone:'',bike:'',pace:'Relaxed touring',notes:'',...fields});write('known-riders',knownRiders);renderRiders();closeModal();toast(existing?'Rider updated.':'Rider added to your circle.')};return true;
}
function scanRider(){
 openModal(`<span class="eyebrow">YOUR COMMUNITY</span><h2>Scan a rider’s QR</h2><p class="modal-intro">Use your camera, choose a QR image, or paste a rider link.</p><video id="scan-video" playsinline muted hidden></video><div class="connect-actions"><button class="primary" id="start-camera">Start camera</button><button class="secondary" id="stop-camera" hidden>Stop camera</button><label class="secondary" for="qr-image">Choose QR image</label><input id="qr-image" type="file" accept="image/*" hidden></div><p id="scan-status" role="status" class="local-note">Camera starts only when you choose.</p><form id="scan-link-form"><label class="field">Rider link<input name="link" required maxlength="6000" placeholder="Paste an Energica rider link"></label><button class="secondary" type="submit">Review rider</button></form><button class="text-button settings-action" id="invite-instead">Use phone / email instead</button>`);
 $('#invite-instead').onclick=addRiderQuick;
 $('#scan-link-form').onsubmit=e=>{e.preventDefault();reviewRider(new FormData(e.target).get('link'),$('#scan-status'))};
 $('#stop-camera').onclick=()=>{stopScan();$('#scan-video').hidden=true;$('#start-camera').hidden=false;$('#stop-camera').hidden=true;$('#scan-status').textContent='Camera stopped.'};
 $('#start-camera').onclick=startCamera;
 $('#qr-image').onchange=async e=>{
  const file=e.target.files[0],status=$('#scan-status');if(!file)return;stopScan();$('#scan-video').hidden=true;$('#start-camera').hidden=false;$('#stop-camera').hidden=true;
  let url;try{if(file.size>10*1024*1024)throw Error('Choose an image smaller than 10 MB.');url=URL.createObjectURL(file);const img=new Image();img.src=url;await img.decode();if(!status.isConnected)return;const code=decodeRiderImage(img,img.naturalWidth,img.naturalHeight);if(!code)throw Error('No QR found. Try a clear image or paste the rider link.');reviewRider(code.data,status)}catch(error){if(status.isConnected)status.textContent=error.message}finally{if(url)URL.revokeObjectURL(url);e.target.value=''}
 };
}
function decodeRiderImage(image,width,height){const scale=Math.min(1,1400/Math.max(width,height)),canvas=document.createElement('canvas');canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);return jsQR(pixels.data,pixels.width,pixels.height)}
async function startCamera(){
 stopScan();const video=$('#scan-video'),status=$('#scan-status'),button=$('#start-camera');let stream,timer,stopped=false;
 scanCleanup=()=>{stopped=true;clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());video.srcObject=null};
 button.disabled=true;
 try{if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera unavailable. Choose a QR image or paste a rider link.');stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});if(stopped||!video.isConnected){stream.getTracks().forEach(t=>t.stop());return}video.srcObject=stream;video.hidden=false;await video.play();if(stopped)return;button.hidden=true;$('#stop-camera').hidden=false;status.textContent='Keep the whole QR code in view.';
  function scan(){if(stopped||!video.isConnected||!modal.open)return;if(video.readyState>=2&&video.videoWidth){const code=decodeRiderImage(video,video.videoWidth,video.videoHeight);if(code&&reviewRider(code.data,status))return}timer=setTimeout(scan,200)}scan();
 }catch(error){stopScan();if(status.isConnected){video.hidden=true;status.textContent='Camera could not start. Choose a QR image or paste the link.'}}finally{if(button.isConnected)button.disabled=false}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&scanCleanup){stopScan();if($('#scan-status')){$('#scan-video').hidden=true;$('#start-camera').hidden=false;$('#stop-camera').hidden=true;$('#scan-status').textContent='Camera paused. Start it again when ready.'}}});
