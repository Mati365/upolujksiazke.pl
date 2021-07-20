lock '~> 3.14.0'

set :application, 'upolujksiazke.pl'
set :repo_url, 'git@github.com:upolujksiazke/upolujksiazke.pl.git'
set :linked_dirs, fetch(:linked_dirs, []).push('node_modules')
set :yarn_variables, ''

namespace :deploy do
  task :build_yarn do
    sh "rm -rf /tmp/#{fetch(:application)}"
    sh "git clone -b #{fetch(:branch)} #{fetch(:repo_url)} /tmp/#{fetch(:application)}"
    sh "cd /tmp/#{fetch(:application)} \
        && yarn install \
        && #{fetch(:app_env)} yarn build:production"
  end

  task :rsync_build do
    sh "rsync -e \"ssh -o StrictHostKeyChecking=no\" -v -a /tmp/#{fetch(:application)}/dist deploy@upolujksiazke.pl:#{release_path}/"
  end

  task :cleanup_tmp do
    sh "rm -rf /tmp/#{fetch(:application)}"
  end

  task :migrate do
    on roles(:app) do
      execute "cd #{release_path} \
        && mkdir tmp \
        && chown deploy:webusers -R ./tmp ./dist \
        && chmod -R 770 ./tmp ./dist \
        && ln -sf ../../.env ./.env \
        && ln -sf ../../.pgpass ./.pgpass \
        && yarn run bull:wait_if_has_jobs \
        && yarn run migration:run"
    end
  end

  task :restart do
    on roles(:app), in: :sequence do
      execute :sudo, "systemctl restart #{fetch(:systemd_service)}"
    end
  end

  task :background_jobs do
    on roles(:app) do
      def exec_background_job(command)
        execute "sudo su web -c \"cd #{release_path} && nohup #{command} &\" &> /dev/null; sleep 1"
      end

      exec_background_job('yarn run sitemap:refresh')
      exec_background_job('node_modules/.bin/gulp cache:warmup')
    end
  end
end

namespace :yarn do
  task :install do
  end
end

after 'yarn:install', 'deploy:build_yarn'
after 'deploy:build_yarn', 'deploy:rsync_build'
after 'deploy:rsync_build', 'deploy:migrate'
after 'deploy:publishing', 'deploy:cleanup_tmp'
after 'deploy:publishing', 'deploy:restart'
after 'deploy:restart', 'deploy:background_jobs'
