# frozen_string_literal: true

class TranslationService::Lingvanex < TranslationService
  def initialize(base_url)
    super()

    @base_url = base_url
  end

  def translate(text, source_language, target_language)
    case source_language
    when 'nb'
      modified_source_language = 'no'
    when 'zh-CN'
      modified_source_language = 'zh-Hans'
    when 'zh-TW'
      modified_source_language = 'zh-Hant'
    when 'zh'
      modified_source_language = 'zh-Hans'
    when 'sr'
      modified_source_language = 'sr-Cyrl'
    end
    case target_language
    when 'nb'
      target_language = 'no'
    when 'zh-CN'
      target_language = 'zh-Hans'
    when 'zh-TW'
      target_language = 'zh-Hant'
    when 'zh'
      target_language = 'zh-Hans'
    when 'sr'
      target_language = 'sr-Cyrl'
    end

    body = Oj.dump(q: text, source: modified_source_language.presence || source_language.presence || 'auto', target: target_language, translateMode: 'html')
    request(:post, '/api/translate', body: body) do |res|
      case res.code
      when 429
        raise TooManyRequestsError
      when 403
        raise QuotaExceededError
      when 200...300
        transform_response(res.body_with_limit, source_language)
      when 400
        raise NotConfiguredError
      else
        raise UnexpectedResponseError
      end
    end
  end

  def languages
    source_languages = %w(nb zh) + fetch_languages
    source_languages = source_languages.sort.map do |language|
      if language == "zh-Hans"
        "zh-CN"
      elsif language == "zh-Hant"
        "zh-TW"
      elsif language == "sr-Cyrl"
        "sr"
      else
        language
      end
    end
    target_languages = source_languages
    source_languages.index_with { |language| target_languages.without(nil, language) }
  end

  def fetch_languages
      request(:get, '/list/languages.json') do |res|
        Oj.load(res.body_with_limit)
      end
  end

  private

  def request(verb, path, **options)
    req = Request.new(verb, "#{@base_url}#{path}", allow_local: true, **options)
    req.add_headers('Content-Type': 'application/json')
    req.perform do |res|
      case res.code
      when 429
        raise TooManyRequestsError
      when 403
        raise QuotaExceededError
      when 200...300
        yield res
      else
        raise UnexpectedResponseError
      end
    end
  end

  def transform_response(json, source_language)
    data = Oj.load(json, mode: :strict)
    raise UnexpectedResponseError unless data.is_a?(Hash)

    data['translatedText'].map.with_index do |text, index|
      Translation.new(
        text: text,
        detected_source_language: data.dig('detectedLanguage', index, 'language') || source_language,
        provider: 'Vivaldi Translate'
      )
    end
  rescue Oj::ParseError
    raise UnexpectedResponseError
  end
end