export default {
  required: (text, method = ['blur', 'change']) => ({
    required: true,
    message: text,
    trigger: method,
  }),
  phone: {
    pattern:
      /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
    message: '请填写符合要求的11位手机号',
    trigger: 'blur',
  },
  idCard: {
    pattern:
      /(^\d{8}(0\d|10|11|12)([0-2]\d|30|31)\d{3}$)|(^\d{6}(18|19|20)\d{2}(0[1-9]|10|11|12)([0-2]\d|30|31)\d{3}(\d|X|x)$)/,
    message: '请填写符合要求的身份证号',
    trigger: 'blur',
  },
};
