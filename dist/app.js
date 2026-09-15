const config=window.SUNDAR_CONFIG,phone=config.whatsappNumber,categories=[],products=[];
let selected='All';
const filters=document.querySelector('#categoryFilters'),grid=document.querySelector('#productGrid'),designTitle=document.querySelector('#design-title'),designStatus=document.querySelector('#designStatus'),enquirySuccess=document.querySelector('#enquirySuccess'),enquiryDialog=document.querySelector('#enquiryDialog'),enquiryForm=document.querySelector('#enquiryForm'),enquiryError=document.querySelector('#enquiryError'),enquirySubmit=document.querySelector('#enquirySubmit');
let selectedEnquiryDesign=null;
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const cropStyle=product=>`--image:url('${String(product.image||'').replace(/[()'"\\]/g,'')}');background-size:contain;background-position:center`;
const formatPrice=price=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(price);

function renderFilters(){
  filters.innerHTML=categories.map(item=>`<button class="category-card ${item.category===selected?'active':''}" data-category="${escapeHtml(item.category)}" aria-pressed="${item.category===selected}"><span class="category-preview" style="${cropStyle(item)}"></span><span class="category-label"><span>✦</span><strong>${escapeHtml(item.category)}</strong></span></button>`).join('');
}
function visibleProducts(){return selected==='All'?products:products.filter(product=>product.category===selected)}
function renderProducts(){
  const list=visibleProducts();
  designTitle.textContent=selected==='All'?'Popular from our workshop':`${selected} designs`;
  grid.innerHTML=list.map(product=>`<article class="product-card" tabindex="0" data-id="${product.id}" aria-label="View ${escapeHtml(product.name)}"><div class="product-image" style="${cropStyle(product)}"><span>View design</span></div><div class="product-body"><small>${escapeHtml(product.category)}</small><h3>${escapeHtml(product.name)}</h3><div class="product-meta"><span>${formatPrice(product.price)}</span></div><button class="button enquiry-button" type="button" data-enquire-id="${product.id}">Enquire Now</button></div></article>`).join('');
}
filters.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;selected=button.dataset.category;renderFilters();renderProducts();document.querySelector('#designs').scrollIntoView({behavior:'smooth',block:'start'})});
document.querySelector('#showAll').onclick=()=>{selected='All';renderFilters();renderProducts()};

function openProduct(id){
  const original=products.find(product=>String(product.id)===String(id));
  if(!original)return;
  const items=products.filter(product=>product.category===original.category);
  let active=items.findIndex(product=>product.id===original.id);
  const detail=document.querySelector('#productDetail');
  function renderDetail(){
    const product=items[active],message=encodeURIComponent(`Hello Sundar Embroidery Works, I am interested in ${product.name} from your ${product.category} collection. Please share details.`);
    detail.innerHTML=`<div class="detail-main"><button class="gallery-arrow previous" aria-label="Previous design">‹</button><div class="detail-image" role="img" aria-label="${escapeHtml(product.name)}" style="${cropStyle(product)}"></div><button class="gallery-arrow next" aria-label="Next design">›</button></div><div class="gallery-strip" aria-label="${items.length} ${escapeHtml(product.category)} designs">${items.map((item,index)=>`<button class="gallery-thumb ${index===active?'active':''}" data-gallery-index="${index}" aria-label="Show ${escapeHtml(item.name)}" style="${cropStyle(item)}"></button>`).join('')}</div><div class="detail-content"><p class="eyebrow">${escapeHtml(product.category)} · ${active+1} of ${items.length}</p><h2>${escapeHtml(product.name)}</h2><p><strong>${formatPrice(product.price)}</strong></p><p>We can customize fabric, dimensions, thread colours and motif placement for your order.</p><a class="button primary" target="_blank" rel="noopener" href="https://wa.me/${phone}?text=${message}">Enquire on WhatsApp</a></div>`;
    detail.querySelector('.previous').onclick=()=>{active=(active+items.length-1)%items.length;renderDetail()};
    detail.querySelector('.next').onclick=()=>{active=(active+1)%items.length;renderDetail()};
    detail.querySelectorAll('[data-gallery-index]').forEach(button=>button.onclick=()=>{active=Number(button.dataset.galleryIndex);renderDetail()});
  }
  renderDetail();
  document.querySelector('#productDialog').showModal();
}
function resetEnquiry(){enquiryForm.reset();enquiryForm.elements.quantity.value=1;enquiryForm.elements.enquiryType.value='Normal';enquiryError.textContent='';selectedEnquiryDesign=null}
function openEnquiry(id){
  const product=products.find(item=>String(item.id)===String(id));
  if(!product)return;
  resetEnquiry();
  selectedEnquiryDesign=product;
  const image=document.querySelector('#enquiryDesignImage');
  image.src=product.image;
  image.alt=product.name;
  document.querySelector('#enquiryDesignName').textContent=product.name;
  document.querySelector('#enquiryDesignPrice').textContent=Number.isFinite(product.price)?formatPrice(product.price):'';
  enquiryDialog.showModal();
}
grid.addEventListener('click',event=>{const enquiryButton=event.target.closest('[data-enquire-id]');if(enquiryButton){event.stopPropagation();openEnquiry(enquiryButton.dataset.enquireId);return}const card=event.target.closest('[data-id]');if(card)openProduct(card.dataset.id)});
grid.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.dataset.id){event.preventDefault();openProduct(event.target.dataset.id)}});
document.querySelector('.dialog-close').onclick=()=>document.querySelector('#productDialog').close();
document.querySelector('#productDialog').addEventListener('click',event=>{if(event.target.id==='productDialog')event.target.close()});
document.querySelector('.enquiry-close').onclick=()=>{enquiryDialog.close();resetEnquiry()};
enquiryDialog.addEventListener('click',event=>{if(event.target===enquiryDialog){enquiryDialog.close();resetEnquiry()}});
enquiryForm.addEventListener('submit',async event=>{
  event.preventDefault();
  enquiryError.textContent='';
  const data=new FormData(enquiryForm),customerName=String(data.get('customerName')).trim(),phoneNumber=String(data.get('phoneNumber')).trim(),quantity=Number(data.get('quantity'));
  if(!customerName||!phoneNumber||!Number.isInteger(quantity)||quantity<1){enquiryError.textContent='Please enter your name, phone number and a quantity of at least 1.';return}
  if(!selectedEnquiryDesign){enquiryError.textContent='Please select a design and try again.';return}
  const requiredDate=String(data.get('requiredDate')||''),notes=String(data.get('notes')||'').trim();
  enquirySubmit.disabled=true;
  enquirySubmit.textContent='Sending...';
  try{
    const response=await fetch(`${config.apiBaseUrl}/enquiries`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({customerName,phoneNumber,designId:selectedEnquiryDesign.id,quantity,enquiryType:data.get('enquiryType'),requiredDate:requiredDate?`${requiredDate}T00:00:00.000Z`:null,notes:notes||null,referenceImageUrl:null})});
    if(!response.ok)throw new Error(`Enquiry request failed with ${response.status}`);
    enquiryDialog.close();
    resetEnquiry();
    enquirySuccess.textContent='Thank you! Your enquiry has been sent to Sundar Embroidery Works. We will contact you shortly.';
  }catch{
    enquiryError.textContent='We could not send your enquiry right now. Please try again.';
  }finally{
    enquirySubmit.disabled=false;
    enquirySubmit.textContent='Send enquiry';
  }
});

document.querySelector('#checkPincode').onclick=()=>{const value=document.querySelector('#pincode').value.trim(),result=document.querySelector('#pincodeResult');if(!/^\d{6}$/.test(value)){result.textContent='Please enter a valid 6-digit pincode.';result.className='error';return}result.textContent=`Thanks! Contact our team to confirm service and delivery for ${value}.`;result.className=''};
document.querySelector('#bulkForm').onsubmit=event=>{event.preventDefault();const data=new FormData(event.target),message=`Hello Sundar Embroidery Works, I need a bulk quote.\nProduct: ${data.get('productType')}\nQuantity: ${data.get('quantity')}\nName: ${data.get('name')}\nMobile: ${data.get('mobile')}\nPincode: ${data.get('deliveryPincode')}\nRequired date: ${data.get('requiredDate')}\nRequirements: ${data.get('requirements')||'Not specified'}`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,'_blank','noopener')};
document.querySelector('#trackButton').onclick=()=>{const value=document.querySelector('#orderNumber').value.trim(),result=document.querySelector('#trackResult');if(!value){result.innerHTML='<p class="error">Please enter your order number.</p>';return}result.innerHTML=`<p class="notice">Demo tracking for <b>${escapeHtml(value)}</b></p><div class="timeline"><span class="done">Order confirmed</span><span class="done">Design finalized</span><span>In production</span><span>Quality check</span><span>Ready / dispatched</span><span>Delivered</span></div>`};
document.querySelector('#year').textContent=new Date().getFullYear();

async function loadPublishedDesigns(){
  designStatus.className='design-status';
  designStatus.textContent='Loading designs…';
  try{
    const response=await fetch(`${config.apiBaseUrl}/designs`,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error(`Design request failed with ${response.status}`);
    const designs=await response.json();
    products.splice(0,products.length,...designs.map(design=>({id:design.id,name:design.name,category:design.category,price:Number(design.price),image:design.imageUrl})));
    const categoryNames=[...new Set(products.map(product=>product.category))];
    categories.splice(0,categories.length,{category:'All',image:products[0]?.image||''},...categoryNames.map(category=>({category,image:products.find(product=>product.category===category)?.image||''})));
    if(selected!=='All'&&!categoryNames.includes(selected))selected='All';
    renderFilters();
    renderProducts();
    designStatus.textContent=products.length?'':'No published designs are available yet. Please check again soon.';
  }catch{
    products.splice(0);
    categories.splice(0);
    renderFilters();
    renderProducts();
    designStatus.className='design-status error';
    designStatus.textContent='We could not load the designs right now. Please refresh and try again.';
  }
}
void loadPublishedDesigns();
window.addEventListener('pageshow',event=>{if(event.persisted)void loadPublishedDesigns()});
if('serviceWorker'in navigator){
  let refreshed=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!refreshed){refreshed=true;location.reload()}});
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{});
}
