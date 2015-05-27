module Praxis

  class Multipart < Attributor::Hash

    @key_type = Attributor::String

    def self.load(value, context=Attributor::DEFAULT_ROOT_CONTEXT, content_type:nil)
      return value if value.kind_of?(self) || value.nil?

      unless (value.kind_of?(::String) && ! content_type.nil?)
        raise Attributor::CoercionError, context: context, from: value.class, to: self.name, value: value
      end

      headers = {'Content-Type' => content_type}
      parser = MultipartParser.new(headers, value)
      preamble, parts = parser.parse

      hash = Hash[parts.collect { |name, part| [name, part.body] }]

      instance = super(hash, context, **options)

      instance.preamble = preamble
      instance.parts = parts
      instance.headers = headers

      instance
    end

    def self.example(context=nil, options: {})
      form = MIME::Multipart::FormData.new

      super(context, options: options).each do |k,v|
        body = if v.respond_to?(:dump) && !v.kind_of?(String)
          JSON.pretty_generate(v.dump)
        else
          v
        end

        entity = MIME::Text.new(body)

        form.add entity, String(k)
      end

      content_type = form.headers.get('Content-Type')
      body = form.body.to_s

      self.load(body, context, content_type: content_type)
      #result.each do |k, v|
      #  result.parts[k] = MultipartPart.new(v)
      #end

      #result.headers = {'Content-Type'}


    end

    attr_accessor :preamble
    attr_accessor :parts
    attr_accessor :headers


    def validate(context=Attributor::DEFAULT_ROOT_CONTEXT)
      super
    end

    def self.describe(shallow = false)
      hash = super
      hash.merge!(family: 'multipart')
      hash
    end
  end


end
