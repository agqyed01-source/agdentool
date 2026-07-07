fetch('http://localhost:3000/api/woo/get/coupons/-/code/6qws9y9e')
.then(res => res.json())
.then(data => console.log("GET SUCCESS:", data.length > 0 ? data[0].code : "empty"))
.catch(err => console.error(err));
