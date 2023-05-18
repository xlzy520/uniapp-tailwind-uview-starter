<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  // @ts-ignore
  mpType: 'app',
  onLaunch() {
    console.log('App Launch');
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  },
});
</script>

<style lang="scss">
/*每个页面公共css */
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
@import 'uview-ui/index.scss';
@import '~uview-ui/index.scss';
@import './style/index.scss';

/*默认为row，横向排列*/
.layout-items-center {
  display: flex;
  align-items: center;
}

.layout-items-baseline {
  display: flex;
  align-items: baseline;
}

.layout-baseline-between {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

/*左右居中*/
.layout-center {
  display: flex;
  justify-content: center;
}

/*两边排列*/
.layout-slide {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/*左中右排列*/
.layout-around {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

/*两边排列, 换行*/
.layout-slide-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

/*上下排列*/
.layout-col-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/*左右垂直居中*/

.layout-abs-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/*横向左右垂直居右*/
.layout-end {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/*纵向左右垂直居中*/
.layout-col-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.text-overflow-hidden {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mb-2 {
  margin-bottom: 10px;
}
</style>
