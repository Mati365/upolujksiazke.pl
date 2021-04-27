# frozen_string_literal: true

require 'net/ssh/proxy/command'

set :use_sudo, false

set :rvm_ruby_version, '2.5.1'
set :rvm_type, :system

set :yarn_flags, '--silent --no-progress'

set :default_env, {
  'APP_ENV' => 'production'
}

fetch(:default_env)[:rvm_path] = '/usr/local/rvm'

set :deploy_to,           '/var/www/upolujksiazke.pl'
set :stage,               :production
set :app_env,             'NODE_ENV=production APP_ENV=production'
set :log_level,           :info
set :format,              :airbrussh

set :branch, 'master'

set :bundle_without, %w[development test].join(' ')
set :bundle_roles, :all

set :systemd_service, 'node-upolujksiazke'

server 'upolujksiazke.pl', user: 'deploy', roles: %w[web app]
