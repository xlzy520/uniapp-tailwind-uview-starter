export const getList = {
  data() {
    return {
      pageOption: {
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
      totalPages: 0,
      list: [],
    };
  },
  mounted() {
    this.getList(true);
  },
  methods: {
    currentChange(val) {
      this.pageOption.pageNum = val;
      this.getList(true);
    },
    handleResFromMixin(res, mapFn = (v) => v, isRefresh = false) {
      const { list, total = 0, pageNum } = res;
      const transformedList = (list || []).map(mapFn);
      if (isRefresh) {
        this.list = transformedList;
      } else {
        this.list = this.list.concat(transformedList);
      }
      this.total = total;
      this.pageOption.pageNum = pageNum;
    },
  },
  onPullDownRefresh() {
    this.pageOption = {
      pageNum: 1,
      pageSize: 10,
    };
    this.getList(true);
  },
  onReachBottom() {
    if (this.pageOption.pageNum < this.totalPages) {
      this.pageOption.pageNum++;
      this.getList();
    }
  },
};
