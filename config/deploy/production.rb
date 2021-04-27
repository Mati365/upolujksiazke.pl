# frozen_string_literal: true

require 'net/ssh/proxy/command'

set :use_sudo, false

set :rvm_ruby_version, '3.0.0'
set :rvm_type, :system

set :yarn_flags, '--silent --no-progress'

set :default_env, {
  'APP_ENV' => 'production'
}

fetch(:default_env)[:rvm_path] = '/home/deploy/.rvm/bin/rvm'

set :deploy_to,           '/var/www/upolujksiazke.pl'
set :stage,               :production
set :app_env,             'NODE_ENV=production APP_ENV=production'
set :log_level,           :info
set :format,              :airbrussh

set :branch, 'main'

set :bundle_without, %w[development test].join(' ')
set :bundle_roles, :all

set :systemd_service, 'node-upolujksiazke'

server 'upolujksiazke.pl', user: 'deploy', roles: %w[web app]
