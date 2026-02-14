var buildHeaders = (opt) => {
  let headers = {
    'Accept': 'application/json'
  }

  if (!opt.multipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (opt.api_token) {
    headers['api_token'] = opt.api_token;
  }
  return headers;
}

const request = (method, url, data, opt={}) => {
  let body;
  if (data) {
    if (opt.multipart) {
      body = new FormData();
      for (let key of Object.keys(data)) {
        let full_key = opt.root ? opt.root + '[' + key + ']' : key;
        body.append(full_key, data[key]);
      }
    } else {
      body = JSON.stringify(data);
    }
  }


  let p = new Promise((done, reject) => {
    let headers = buildHeaders(opt);
    fetch(url, {method: method, body, headers})
      .then((response) => {
        if(response.ok) {
          response.json().then((data) => done(data));
        } else {
          response.json().then((data) => {
            // data._response = response;
            reject(data)
          });
        }
      })
      .catch(error => {
        reject({error});
      });
  });
  return p;
};


export default request;
