'use strict';
// Enquiries from the lounge to Energica. Posts to /api/lounge, which emails the sales team.
// Only what the visitor types here and the item shown in "Included" is sent.
// Riders' saved contacts, notes, rides and other lounge data never leave the device.
const leadCopy={
 product:{eyebrow:'ENERGICA CONCEPT · INTEREST',title:'Register your interest.',intro:'This is an Energica concept, not yet on sale. Tell Energica you are interested and the team may contact you about it.',button:'Register interest'},
 selection:{eyebrow:'ENERGICA CONCEPTS · INTEREST',title:'Register your interest.',intro:'These Energica concepts are not yet on sale. Tell Energica which ones interest you and the team may contact you about them.',button:'Register interest'},
 service:{eyebrow:'GARAGE · SERVICE',title:'Request a service.',intro:'Ask Energica to arrange a service or inspection for your motorcycle.',button:'Send request'},
 community:{eyebrow:'YOUR ENERGICA',title:'Join the Energica community.',intro:'Share your details so Energica can invite you to rides and events.',button:'Join'}
};
function leadContact(){const saved=read('lead-contact',{}),p=state.profile||{};return{name:saved.name||(p.name&&p.name!=='Rider'?p.name:''),email:saved.email||p.email||'',phone:saved.phone||'',location:saved.location||p.location||''}}
function loungeLead(kind,context={}){
 const copy=leadCopy[kind],c=leadContact(),startedAt=Date.now();
 const included=Object.entries(context).filter(([,v])=>v!==''&&v!=null&&!(Array.isArray(v)&&!v.length));
 openModal(`<span class="eyebrow">${copy.eyebrow}</span><h2>${copy.title}</h2><p class="modal-intro">${copy.intro}</p>
 <form id="lead-form" class="lead-form" novalidate>
  ${included.length?`<div class="lead-included"><small>INCLUDED</small>${included.map(([k,v])=>`<p><b>${esc(k)}</b> ${esc(Array.isArray(v)?v.join(', '):v)}</p>`).join('')}</div>`:''}
  <div class="form-columns"><label class="field">Name *<input name="name" required maxlength="80" autocomplete="name" value="${esc(c.name)}"></label><label class="field">Email *<input name="email" type="email" required maxlength="150" autocomplete="email" value="${esc(c.email)}"></label></div>
  <div class="form-columns"><label class="field">Phone<input name="phone" type="tel" maxlength="40" autocomplete="tel" value="${esc(c.phone)}" placeholder="Optional"></label><label class="field">City / country<input name="location" maxlength="100" autocomplete="address-level2" value="${esc(c.location)}" placeholder="Optional"></label></div>
  <label class="field">Message<textarea name="message" rows="3" maxlength="2000" placeholder="Optional"></textarea></label>
  <label class="lead-hp" aria-hidden="true">Company<input name="company" tabindex="-1" autocomplete="off"></label>
  <label class="lead-consent"><input type="checkbox" name="consent" required> <span>I agree that Energica may contact me about this request. See the <a href="https://energicamotor.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</span></label>
  <p class="lead-status" id="lead-status" role="status" aria-live="polite"></p>
  <div class="form-actions"><button class="secondary" type="button" id="lead-cancel">Cancel</button><button class="primary" type="submit" id="lead-submit">${copy.button} <i data-lucide="arrow-up-right"></i></button></div>
  <p class="local-note">Sent to Energica by email. Your other lounge data stays on this device.</p>
 </form>`);
 $('#lead-cancel').onclick=closeModal;
 $('#lead-form').onsubmit=async e=>{
  e.preventDefault();const form=e.target,f=new FormData(form),status=$('#lead-status'),button=$('#lead-submit');
  const data={kind,name:String(f.get('name')||'').trim(),email:String(f.get('email')||'').trim(),phone:String(f.get('phone')||'').trim(),location:String(f.get('location')||'').trim(),message:String(f.get('message')||'').trim(),company:String(f.get('company')||''),consent:form.consent.checked,context:Object.fromEntries(included),startedAt};
  status.classList.remove('error');
  if(!data.name){status.textContent='Please enter your name.';status.classList.add('error');form.name.focus();return}
  if(!/^\S+@\S+\.\S{2,}$/.test(data.email)){status.textContent='Please enter a valid email address.';status.classList.add('error');form.email.focus();return}
  if(!data.consent){status.textContent='Please confirm that Energica may contact you.';status.classList.add('error');form.consent.focus();return}
  button.disabled=true;status.textContent='Sending…';
  try{
   const res=await fetch('/api/lounge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   const out=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(out.error||'Could not send right now. Please try again.');
   write('lead-contact',{name:data.name,email:data.email,phone:data.phone,location:data.location});
   openModal(`<span class="eyebrow">${copy.eyebrow}</span><h2>Thank you, ${esc(data.name.split(' ')[0])}.</h2><div class="success-note">Your request has been sent to Energica. The team will contact you at ${esc(data.email)}.</div><div class="form-actions"><button class="primary" id="lead-done">Close</button></div>`);
   $('#lead-done').onclick=closeModal;toast('Sent to Energica.');
  }catch(err){if(!status.isConnected)return;status.textContent=err.message||'Could not send right now. Please try again.';status.classList.add('error');button.disabled=false}
 };
}
document.addEventListener('DOMContentLoaded',()=>{
 const service=document.getElementById('lead-service');
 if(service)service.onclick=()=>{const m=(typeof currentBike==='function'&&currentBike())||{};loungeLead('service',{Motorcycle:m.model||'',Year:m.year||'',Odometer:m.odometer?m.odometer+' km':''})};
});
