server {
        if ($host = www.upolujksiazke.pl) {
                return 301 https://$host$request_uri;
        } # managed by Certbot


        if ($host = upolujksiazke.pl) {
                return 301 https://$host$request_uri;
        } # managed by Certbot


        listen         80;
        server_name    www.upolujksiazke.pl upolujksiazke.pl;
        return 301 https://$host$request_uri;
}

server {
        listen        443 http2 ssl;
        server_name www.upolujksiazke.pl upolujksiazke.pl;
        auth_basic           "Proszem wpiszac haszlo";
        auth_basic_user_file /etc/nginx/.htpasswd;

        location /cdn/ {
                alias /var/www/cdn.upolujksiazke.pl/;
                include includes/static-assets.conf;
        }

        location /public/ {
                root /var/www/upolujksiazke.pl/current/dist;
                include includes/static-assets.conf;
        }

        location / {
                proxy_pass http://0.0.0.0:3000;
                proxy_http_version 1.1;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP $remote_addr;
        }

        ssl_certificate /etc/letsencrypt/live/upolujksiazke.pl/fullchain.pem; # managed by Certbot
        ssl_certificate_key /etc/letsencrypt/live/upolujksiazke.pl/privkey.pem; # managed by Certbot
}
