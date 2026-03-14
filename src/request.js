import Stadox from './stadox';

var buildHeaders = (opt) => {
  let api_token = Stadox.get('api_token');


  let headers = {
    'Accept': 'application/json'
  }

  if (!opt.multipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (api_token) {
    headers['Authentication'] = api_token;
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
          console.log("REQUEST ERROR", response);
          response.text().then((data) => {
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
